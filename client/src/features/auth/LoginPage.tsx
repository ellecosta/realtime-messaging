import { useState, type FormEvent } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import { useAuth } from "./AuthContext";
import logo from "../../assets/logo2.png" 
import "./auth.css"

export function LoginPage() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const [loading, setLoading] = useState(false);

    // Hooks

    const { login } = useAuth();
    const navigate = useNavigate();
    const [searchParams] = useSearchParams();

    async function handleSubmit(e: FormEvent) {
        e.preventDefault();
        setError("");

        if (!email || !password) {
            setError("Preencha todos os campos");
            return;
        }

        setLoading(true);
        try {
            await login(email, password);
            const redirect = searchParams.get("redirect") ?? "/";
            navigate(redirect);
        } catch (err: any) {
            setError(err.message ?? "Erro ao fazer login");
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="auth-page">
            <div className="auth-header">
                <Link to="/welcome"><img src={logo} alt="Hive" className="auth-logo"/></Link>
                <p className="slogan">Every message finds its hive</p>
            </div>

            <div className="auth-card">
                <h2>Que bom que voltou!</h2>
                <p className="subtitle">Entre e comece a conversar</p>
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
                    <label htmlFor="password">Senha</label>
                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="••••••"
                    />
                    <a href="#" className="forgot-password">Esqueceu sua senha?</a>
                </div>

                {error && <p className="error">{error}</p>}

                <button type="submit" disabled={loading}>
                    {loading ? "Entrando..." : "Entrar"}
                </button>
            </form>

            <p>
                Não tem conta? <Link to="/register">Criar conta</Link>
            </p>

            </div>
            
        </div>
    );
}