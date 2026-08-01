import { useState, type KeyboardEvent } from "react";
import { useChat } from "./ChatContext";
import "./chat.css";

export function MessageInput() {
    const [content, setContent] = useState("");
    const { sendMessage, state } = useChat();

    function handleSend() {
        const trimmed = content.trim();
        if (!trimmed) return;
        sendMessage(trimmed);
        setContent("");
    }

    function handleKeyDown(e: KeyboardEvent<HTMLTextAreaElement>) {
        if (e.key === "Enter" && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    }

    return (
        <div className="message-input-container">
            <textarea
                className="message-input"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder={
                    state.currentChannelId ? "Digite uma mensagem..." : "Selecione um canal"
                }
                disabled={!state.currentChannelId}
                rows={1}
            />
            <button
                className="send-button"
                onClick={handleSend}
                disabled={!content.trim() || !state.currentChannelId}
            >
                ➤
            </button>
        </div>
    );
}

