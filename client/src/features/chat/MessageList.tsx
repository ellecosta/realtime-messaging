import { useEffect, useRef } from "react";
import { useChat } from "./ChatContext";
import "./chat.css";

export function MessageList() {
    const { state, loadOlderMessages } = useChat();
    const bottomRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const wasAtBottom = useRef(true);

    const channelId = state.currentChannelId;
    const messages = channelId ? state.messagesByChannel [channelId] ?? [] : [];
    const hasMore = channelId ? state.hasMoreByChannel [channelId] ?? false : false;

    function checkIfAtBottom() {
        const el = containerRef.current;
        if (!el) return;
        const threshold = 100;
        wasAtBottom.current = el.scrollHeight - el.scrollTop - el.clientHeight < threshold;
    }

    useEffect(() => {
        if (wasAtBottom.current) {
            bottomRef.current?.scrollIntoView({ behavior: "smooth"});
        }
    }, [messages.length]);

    function handleScroll() {
        checkIfAtBottom();
        const el = containerRef.current;
        if (!el) return;
        if (el.scrollTop === 0 && hasMore) {
            loadOlderMessages();
        }
    }

    function formatTime(iso: string) {
        return new Date(iso).toLocaleDateString("pt-BR", { hour: "2-digit", minute: "2-digit" });
    }

    // Acha o nome do canal atual
    const currentChannel = channelId
        ? (state.channelsByServer[state.currentServerId ?? ""] ?? []).find(ch => ch.id === channelId)
        : null;

    return (
        <div className="message-list" ref={containerRef}
        onScroll={handleScroll}>
            {/* Mensagem de boas-vindas do canal */}
            {!hasMore && currentChannel && (
                <div className="channel-welcome">
                    <div className="channel-welcome-icon">#</div>
                    <h2>Bem-vindo ao #{currentChannel.name}!</h2>
                    <p>Este é o início do canal #{currentChannel.name}.</p>
                </div>
            )}

            {hasMore && (
                <div className="load-more">
                    <button onClick={loadOlderMessages}>Carregar mensagens anteriores</button>
                </div>
            )}

            {messages.map((msg) => (
                <div key={msg.id} className={`message ${msg.pending ? "pending" : ""}`}>
                    <div className="message-header">
                        <span className="message-author">{msg.username}</span>
                        <span className="message-time">{formatTime(msg.createdAt)}</span>
                    </div>
                    <div className="message-content">
                        {msg.content}
                    </div>
                </div>
            ))}

            <div ref={bottomRef} />
        </div>
    );
}