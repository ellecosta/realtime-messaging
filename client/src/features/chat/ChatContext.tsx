import {
    createContext,
    useContext,
    useReducer,
    useEffect,
    type ReactNode,
} from "react";
import type { Server, Channel, Message } from "../../lib/types";
import { api } from "../../lib/http";
import { getSocket } from "../../lib/socket";
import { useAuth } from "../auth/AuthContext";

interface ChatState {
    servers: Server[];
    channelsByServer: Record<string, Channel[]>;
    messagesByChannel: Record<string, Message[]>;
    unreadByChannel: Record<string, number>;
    currentServerId: string | null;
    currentChannelId: string | null;
    hasMoreByChannel: Record<string, boolean>;
}

const initialState: ChatState = {
    servers: [],
    channelsByServer: {},
    messagesByChannel: {},
    unreadByChannel: {},
    currentServerId: null,
    currentChannelId: null,
    hasMoreByChannel: {},
};


type ChatAction =
    | { type: "SERVERS_LOADED"; payload: Server[] }
    | { type: "SERVER_ADDED"; payload: Server }
    | { type: "SERVER_SELECTED"; payload: string }
    | { type: "CHANNELS_LOADED"; payload: { serverId: string; channels: Channel[] } }
    | { type: "CHANNEL_ADDED"; payload: Channel }
    | { type: "CHANNEL_SELECTED"; payload: string }
    | { type: "MESSAGES_LOADED"; payload: { channelId: string; messages: Message[]; hasMore: boolean; prepend: boolean } }
    | { type: "MESSAGE_RECEIVED"; payload: Message }
    | { type: "MESSAGE_SENT"; payload: Message }
    | { type: "MESSAGE_CONFIRMED"; payload: { tempId: string; real: Message } }
    | { type: "MESSAGE_FAILED"; payload: { tempId: string } };


function chatReducer(state: ChatState, action: ChatAction): ChatState {
    switch (action.type) {
        case "SERVERS_LOADED":
            return { ...state, servers: action.payload };

        case "SERVER_ADDED":
            return { ...state, servers: [...state.servers, action.payload] };

        case "SERVER_SELECTED":
            return { ...state, currentServerId: action.payload };

        case "CHANNELS_LOADED":
            return {
                ...state,
                channelsByServer: {
                    ...state.channelsByServer,
                    [action.payload.serverId]: action.payload.channels,
                },
            };

        case "CHANNEL_ADDED": {
            const ch = action.payload;
            const existing = state.channelsByServer[ch.serverId] ?? [];
            return {
                ...state,
                channelsByServer: {
                    ...state.channelsByServer,
                    [ch.serverId]: [...existing, ch],
                },
            };
        }

        case "CHANNEL_SELECTED":
            return {
                ...state,
                currentChannelId: action.payload,
                unreadByChannel: { ...state.unreadByChannel, [action.payload]: 0 },
            };

        case "MESSAGES_LOADED": {
            const { channelId, messages, hasMore, prepend } = action.payload;
            const existing = state.messagesByChannel[channelId] ?? [];
            return {
                ...state,
                messagesByChannel: {
                    ...state.messagesByChannel,
                    [channelId]: prepend ? [...messages, ...existing] : messages,
                },
                hasMoreByChannel: { ...state.hasMoreByChannel, [channelId]: hasMore },
            };
        }

        case "MESSAGE_SENT": {
            const channelId = action.payload.channelId;
            const existing = state.messagesByChannel[channelId] ?? [];
            return {
                ...state,
                messagesByChannel: {
                    ...state.messagesByChannel,
                    [channelId]: [...existing, action.payload],
                },
            };
        }

        case "MESSAGE_CONFIRMED": {
            const { tempId, real } = action.payload;
            const channelId = real.channelId;
            const existing = state.messagesByChannel[channelId] ?? [];
            return {
                ...state,
                messagesByChannel: {
                    ...state.messagesByChannel,
                    [channelId]: existing.map((m) =>
                        m.id === tempId || m.tempId === tempId ? { ...real, pending: false } : m
                    ),
                },
            };
        }

        case "MESSAGE_FAILED": {
            const { tempId } = action.payload;
            const updated = { ...state.messagesByChannel };
            for (const [chId, msgs] of Object.entries(updated)) {
                const idx = msgs.findIndex((m) => m.id === tempId || m.tempId === tempId);
                if (idx !== -1) {
                    updated[chId] = msgs.map((m, i) =>
                        i === idx ? { ...m, pending: false } : m
                    );
                    break;
                }
            }
            return { ...state, messagesByChannel: updated };
        }

        case "MESSAGE_RECEIVED": {
            const msg = action.payload;
            const channelId = msg.channelId;
            const existing = state.messagesByChannel[channelId] ?? [];

            // Reconciliação: msg otimista já existe com esse tempId → substitui
            if (msg.tempId) {
                const idx = existing.findIndex((m) => m.tempId === msg.tempId);
                if (idx !== -1) {
                    return {
                        ...state,
                        messagesByChannel: {
                            ...state.messagesByChannel,
                            [channelId]: existing.map((m, i) =>
                                i === idx ? { ...msg, pending: false } : m
                            ),
                        },
                    };
                }
            }

            // Deduplicação: já tem msg com esse id → ignora
            if (existing.some((m) => m.id === msg.id)) return state;

            // Insere a mensagem no canal
            const newMessages = [...existing, msg];

            // Canal aberto → só insere. Canal fechado → insere + incrementa unread
            if (channelId === state.currentChannelId) {
                return {
                    ...state,
                    messagesByChannel: { ...state.messagesByChannel, [channelId]: newMessages },
                };
            }
            return {
                ...state,
                messagesByChannel: { ...state.messagesByChannel, [channelId]: newMessages },
                unreadByChannel: {
                    ...state.unreadByChannel,
                    [channelId]: (state.unreadByChannel[channelId] ?? 0) + 1,
                },
            };
        }

        default:
            return state;
    }
}


interface ChatContextValue {
    state: ChatState;
    loadServers: () => Promise<void>;
    selectServer: (serverId: string) => Promise<void>;
    selectChannel: (channelId: string) => Promise<void>;
    loadOlderMessages: () => Promise<void>;
    sendMessage: (content: string) => void;
    createServer: (name: string) => Promise<void>;
    createChannel: (name: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | null>(null);

export function useChat(): ChatContextValue {
    const ctx = useContext(ChatContext);
    if (!ctx) throw new Error("useChat deve ser usado dentro de <ChatProvider>");
    return ctx;
}

export function ChatProvider({ children }: { children: ReactNode }) {
    const [state, dispatch] = useReducer(chatReducer, initialState);
    const { user, token } = useAuth();

    // Carregar servidores
    async function loadServers() {
        const servers = await api<Server[]>("/servers");
        dispatch({ type: "SERVERS_LOADED", payload: servers });
    }

    // Selecionar servidor → carrega canais (se não cached) → seleciona general
    async function selectServer(serverId: string) {
        dispatch({ type: "SERVER_SELECTED", payload: serverId });

        let channels = state.channelsByServer[serverId];
        if (!channels) {
            channels = await api<Channel[]>(`/servers/${serverId}/channels`);
            dispatch({ type: "CHANNELS_LOADED", payload: { serverId, channels } });
        }

        const defaultChannel = channels.find((c) => c.isDefault) ?? channels[0];
        if (defaultChannel) {
            await selectChannel(defaultChannel.id);
        }
    }

    // Selecionar canal → carrega mensagens (se não cached)
    async function selectChannel(channelId: string) {
        dispatch({ type: "CHANNEL_SELECTED", payload: channelId });

        if (!state.messagesByChannel[channelId]) {
            const res = await api<{ messages: Message[]; nextCursor: string | null; hasMore: boolean }>(
                `/channels/${channelId}/messages`
            );
            dispatch({
                type: "MESSAGES_LOADED",
                payload: { channelId, messages: res.messages, hasMore: res.hasMore, prepend: false },
            });
        }
    }

    // Criar servidor → adiciona na lista e seleciona
    async function createServer(name: string) {
        const server = await api<Server>("/servers", {
            method: "POST",
            body: JSON.stringify({ name }),
        });
        dispatch({ type: "SERVER_ADDED", payload: server });
        await selectServer(server.id);
    }

    // Criar canal no servidor atual → adiciona na lista e seleciona
    async function createChannel(name: string) {
        if (!state.currentServerId) return;
        const channel = await api<Channel>(`/servers/${state.currentServerId}/channels`, {
            method: "POST",
            body: JSON.stringify({ name }),
        });
        dispatch({ type: "CHANNEL_ADDED", payload: channel });
        await selectChannel(channel.id);
    }

    // Scroll pra cima → carrega mais antigas
    async function loadOlderMessages() {
        const channelId = state.currentChannelId;
        if (!channelId) return;
        if (!state.hasMoreByChannel[channelId]) return;

        const messages = state.messagesByChannel[channelId] ?? [];
        const oldest = messages[0];
        if (!oldest) return;

        const res = await api<{ messages: Message[]; nextCursor: string | null; hasMore: boolean }>(
            `/channels/${channelId}/messages?before=${oldest.id}`
        );
        dispatch({
            type: "MESSAGES_LOADED",
            payload: { channelId, messages: res.messages, hasMore: res.hasMore, prepend: true },
        });
    }

    // Enviar mensagem (otimista via socket)
    function sendMessage(content: string) {
        if (!state.currentChannelId || !user) return;

        const tempId = crypto.randomUUID();
        const channelId = state.currentChannelId;

        const optimistic: Message = {
            id: tempId,
            channelId,
            authorId: user.id,
            username: user.username,
            content,
            createdAt: new Date().toISOString(),
            tempId,
            pending: true,
        };
        dispatch({ type: "MESSAGE_SENT", payload: optimistic });

        const socket = getSocket();
        socket.emit("message:send", { channelId, content, tempId }, (ack: any) => {
            if (ack?.ok) {
                dispatch({ type: "MESSAGE_CONFIRMED", payload: { tempId, real: ack.message } });
            } else {
                dispatch({ type: "MESSAGE_FAILED", payload: { tempId } });
            }
        });
    }

    // Listener do socket: mensagens recebidas de outros usuários
    useEffect(() => {
        if (!token) return;
        const socket = getSocket();

        function onMessageNew(msg: Message) {
            dispatch({ type: "MESSAGE_RECEIVED", payload: msg });
        }

        socket.on("message:new", onMessageNew);
        return () => { socket.off("message:new", onMessageNew); };
    }, [token]);

    // Carregar servidores ao logar
    useEffect(() => {
        if (token) loadServers();
    }, [token]);

    // Auto-selecionar o primeiro servidor quando a lista carrega
    useEffect(() => {
        if (state.servers.length > 0 && !state.currentServerId) {
            selectServer(state.servers[0].id);
        }
    }, [state.servers]);

    return (
        <ChatContext.Provider value={{ state, loadServers, selectServer, selectChannel, loadOlderMessages, sendMessage, createServer, createChannel }}>
            {children}
        </ChatContext.Provider>
    );
}
