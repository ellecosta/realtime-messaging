import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { api } from "../../lib/http";
import { getSocket } from "../../lib/socket";
import { useAuth } from "../auth/AuthContext";
import { useChat } from "../chat/ChatContext";

interface InvitePreview {
    code: string;
    server: { id: string; name: string };
    expiresAt: string | null;
    maxUses: number | null;
    uses: number;
}

export function InvitePage() {
    const { code } = useParams<{ code: string }>();
    const { user } = useAuth();
    const { loadServers, selectServer } = useChat();
    const navigate = useNavigate();

    const [preview, setPreview] = useState<InvitePreview | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(true);
    const [accepting, setAccepting] = useState(false);

    // Se não está logado, redireciona pro login guardando o destino
    useEffect(() => {
        if (!user) {
            navigate(`/login?redirect=/invite/${code}`, { replace: true });
        }
    }, [user, code, navigate]);

    // Busca preview do convite
    useEffect(() => {
        if (!code || !user) return;

        api<InvitePreview>(`/invites/${code}`)
            .then(setPreview)
            .catch((err: any) => setError(err.message ?? "Convite inválido"))
            .finally(() => setLoading(false));
    }, [code, user]);

    async function handleAccept() {
        if (!code) return;
        setAccepting(true);
        setError("");

        try {
            const res = await api<{ serverId: string; alreadyMember: boolean }>(
                `/invites/${code}/accept`,
                { method: "POST" }
            );

            // Entra na room do socket pra receber msgs ao vivo sem reconectar
            const socket = getSocket();
            socket.emit("server:join", { serverId: res.serverId });

            // Recarrega a lista de servidores e navega pro servidor
            await loadServers();
            await selectServer(res.serverId);
            navigate("/");
        } catch (err: any) {
            setError(err.message ?? "Erro ao aceitar convite");
        } finally {
            setAccepting(false);
        }
    }

    if (!user) return null;
    if (loading) return <div className="auth-page"><p>Carregando convite...</p></div>;

    return (
        <div className="auth-page">
            {error && !preview ? (
                <>
                    <h1>Convite inválido</h1>
                    <p className="error">{error}</p>
                    <button onClick={() => navigate("/")}>Voltar</button>
                </>
            ) : preview ? (
                <>
                    <h1>Você foi convidado!</h1>
                    <p>Servidor: <strong>{preview.server.name}</strong></p>
                    {error && <p className="error">{error}</p>}
                    <button onClick={handleAccept} disabled={accepting}>
                        {accepting ? "Entrando..." : "Entrar no servidor"}
                    </button>
                </>
            ) : null}
        </div>
    );
}
