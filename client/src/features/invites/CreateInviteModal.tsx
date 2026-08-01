import { useState, type FormEvent } from "react";
import { api } from "../../lib/http";
import "../chat/chat.css";

interface Props {
    serverId: string;
    onClose: () => void;
}

interface InviteResult {
    code: string;
    serverId: string;
    expiresAt: string | null;
    maxUses: number | null;
    uses: number;
}

export function CreateInviteModal({ serverId, onClose }: Props) {
    const [maxUses, setMaxUses] = useState("");
    const [expiresInHours, setExpiresInHours] = useState("");
    const [result, setResult] = useState<InviteResult | null>(null);
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");
        setLoading(true);

        try {
            const body: Record<string, number> = {};
            if (maxUses) body.maxUses = Number(maxUses);
            if (expiresInHours) body.expiresInHours = Number(expiresInHours);

            const res = await api<InviteResult>(`/servers/${serverId}/invites`, {
                method: "POST",
                body: JSON.stringify(body),
            });
            setResult(res);
        } catch (err: any) {
            setError(err.message ?? "Erro ao gerar convite");
        } finally {
            setLoading(false);
        }
    }

    const inviteLink = result ? `${window.location.origin}/invite/${result.code}` : "";

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <h2>Gerar Convite</h2>

                {result ? (
                    <div className="modal-result">
                        <p>Link do convite:</p>
                        <input
                            type="text"
                            value={inviteLink}
                            readOnly
                            onClick={(e) => (e.target as HTMLInputElement).select()}
                        />
                        <div className="modal-actions">
                            <button type="submit" onClick={() => { navigator.clipboard.writeText(inviteLink); }}>
                                Copiar link
                            </button>
                            <button type="button" onClick={onClose}>Fechar</button>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleSubmit}>
                        <div>
                            <label htmlFor="maxUses">Usos máximos (opcional)</label>
                            <input
                                id="maxUses"
                                type="number"
                                min="1"
                                max="1000"
                                value={maxUses}
                                onChange={(e) => setMaxUses(e.target.value)}
                                placeholder="Ilimitado"
                            />
                        </div>

                        <div>
                            <label htmlFor="expires">Expira em horas (opcional)</label>
                            <input
                                id="expires"
                                type="number"
                                min="1"
                                max="720"
                                value={expiresInHours}
                                onChange={(e) => setExpiresInHours(e.target.value)}
                                placeholder="Nunca"
                            />
                        </div>

                        {error && <p className="error">{error}</p>}

                        <div className="modal-actions">
                            <button type="submit" disabled={loading}>
                                {loading ? "Gerando..." : "Gerar convite"}
                            </button>
                            <button type="button" onClick={onClose}>Cancelar</button>
                        </div>
                    </form>
                )}
            </div>
        </div>
    );
}
