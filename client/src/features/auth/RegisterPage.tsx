import { useState, type FormEvent } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./auth.css"

export function RegisterPage() {
    const [email, setEmail] = useState("");
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    const { register } = useAuth();
    const navigate = useNavigate();

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");

        if (!email || !username || !password) {
            setError("Preencha todos os campos");
            return;
        }
        if (username.length < 2) {
            setError("Username precisa de pelo menos 2 caracteres");
            return;
        }
        if (password.length < 6) {
            setError("Senha precisa de pelo menos 6 caracteres");
            return;
        }

        setLoading(true);
        try {
            await register(email, username, password);
            navigate("/");
        } catch (err: any) {
            setError(err.message ?? "Erro ao criar conta");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <h1>Criar Conta</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">Email</label>
                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="seu@email.com"
                    />
                </div>

                <div>
                    <label htmlFor="username">Username</label>
                    <input
                        id="username"
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        placeholder="seu nome"
                    />
                </div>

                <div>
                    <label htmlFor="password">Senha</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="mínimo 6 caracteres"
                    />
                </div>

                {error && <p className="error">{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Criando..." : "Criar conta"}
                </button>
            </form>

            <p>
                Já tem conta? <Link to="/login">Fazer login</Link>
            </p>
        </div>
    );
}