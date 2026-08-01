import { useState } from "react";
import { useChat } from "./ChatContext";
import { useAuth } from "../auth/AuthContext";
import { CreateInviteModal } from "../invites/CreateInviteModal";

export function ChannelList() {
    const { state, selectChannel, createChannel } = useChat();
    const { logout } = useAuth();
    const [showNewChannel, setShowNewChannel] = useState(false);
    const [showInvite, setShowInvite] = useState(false);
    const [channelName, setChannelName] = useState("");
    const [error, setError] = useState("");

    const channels = state.currentServerId 
        ? state.channelsByServer[state.currentServerId] ?? []
        : [];
    
    async function handleCreateChannel() {
        if (!channelName.trim()) return;
        setError("");
        try {
            await createChannel(channelName.trim());
            setChannelName("");
            setShowNewChannel(false);
        } catch (err: any) {
            setError(err.message);
        }
    }

    return (
        <aside className="channel-list">
            <div className="channel-header">
                <h2>{state.servers.find((s) => s.id === state.currentServerId)?.name ?? "Servidor"}</h2>
            </div>

            <nav className="channel-nav">
                {channels.map((ch) => {
                    const isActive = ch.id === state.currentChannelId;
                    const unread = state.unreadByChannel[ch.id] ?? 0;
                    return (
                        <button
                            key={ch.id}
                            className={`channel-item ${isActive ? "active" : ""}`}
                            onClick={() => selectChannel(ch.id)}
                        >
                            <span className="channel-name"># {ch.name}</span>
                            {unread > 0 && <span className="badge">{unread}</span>}
                        </button>
                    );
                })}
            </nav>

            <div className="channel-actions">
                <button onClick={() => setShowNewChannel(true)}>+ Canal</button>
                <button onClick={() => setShowInvite(true)}>🔗 Convite</button>
                <button onClick={logout} className="logout-btn">Sair</button>
            </div>

            {showNewChannel && (
                <div className="modal-overlay" onClick={() => setShowNewChannel(false)}>
                    <div className="modal" onClick={(e) => e.stopPropagation()}>
                        <h2>Criar Canal</h2>
                        <form onSubmit={(e) => { e.preventDefault(); handleCreateChannel(); }}>
                            <div>
                                <label htmlFor="channelName">Nome do canal</label>
                                <input
                                    id="channelName"
                                    value={channelName}
                                    onChange={(e) => setChannelName(e.target.value)}
                                    placeholder="novo-canal"
                                />
                            </div>
                            {error && <p className="error">{error}</p>}
                            <div className="modal-actions">
                                <button type="submit">Criar</button>
                                <button type="button" onClick={() => setShowNewChannel(false)}>Cancelar</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showInvite && state.currentServerId && (
                <CreateInviteModal
                    serverId={state.currentServerId}
                    onClose={() => setShowInvite(false)}
                />
            )}
        </aside>
    );
}