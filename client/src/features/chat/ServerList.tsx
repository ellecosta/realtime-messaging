import { useState } from "react";
import { useChat } from "./ChatContext";
import logo from "../../assets/logo3.png";
import "./chat.css";

export function ServerList() {
    const { state, selectServer, createServer } = useChat();
    const [showCreate, setShowCreate] = useState(false);
    const [newName, setNewName] = useState("");
    const [error, setError] = useState("");

    // Calcula não-lido total por servidor

    function getServerUnread(serverId: string) {
        const channels = state.channelsByServer[serverId] ?? [];
        return channels.reduce((sum, ch) => sum + (state.unreadByChannel[ch.id] ?? 0), 0);
    }

    async function handleCreate() {
        if (!newName.trim()) return;
        setError("");
        try {
            await createServer(newName.trim());
            setNewName("");
            setShowCreate(false);
        } catch (err: any) {
            setError(err.message);
        }
    }

    return (
        <aside className="server-list">
            <img src={logo} alt="Hive" className="server-logo" />
            <div className="server-divider" />

            {state.servers.map((server) => {
                const isActive = server.id === state.currentServerId;
                const unread = getServerUnread(server.id);
                return (
                    <button
                        key={server.id}
                        className={`server-icon ${isActive ? "active" : ""}`}
                        onClick={() => selectServer(server.id)}
                        title={server.name}
                    >
                        {server.name[0].toUpperCase()}
                        {unread > 0 && <span className="badge">{unread}</span>}
                    </button>
                );
            })}

            <button
                className="server-icon add"
                onClick={() => setShowCreate(true)}
                title="Criar servidor"
            >
                +
            </button>

            {showCreate && (
                <div className="create-popup">
                    <input
                        value={newName}
                        onChange={(e) => setNewName(e.target.value)}
                        placeholder="Nome do servidor"
                        onKeyDown={(e) => e.key === "Enter" && handleCreate()}
                    />
                    <button onClick={handleCreate}>Criar</button>
                    <button onClick={() => setShowCreate(false)}>X</button>
                    {error && <p className="error">{error}</p>}
                </div>
            )}
        </aside>
    );
}