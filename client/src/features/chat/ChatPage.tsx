import { ServerList } from "./ServerList";
import { ChannelList } from "./ChannelList";
import { MessageList } from "./MessageList";
import { MessageInput } from "./MessageInput";
import { useChat } from "./ChatContext";
import "./chat.css";

export function ChatPage() {
    const { state } = useChat();

    return (
        <div className="chat-layout">
            <ServerList />
            <ChannelList />
            <main className="chat-main">
                {state.currentChannelId ? (
                    <>
                        <MessageList />
                        <MessageInput />
                    </>
                ) : (
                    <div className="chat-empty">
                        Selecione um servidor e canal para começar
                    </div>
                )}
            </main>
        </div>
    );
}