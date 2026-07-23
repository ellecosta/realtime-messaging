import { createContext, useContext, useState, useEffect, type ReactNode } from "react";
import type { User } from "../../lib/types";
import { api } from "../../lib/http";
import { getToken, setToken, clearToken } from "../../lib/tokenStorage";
import { connectSocket, disconnectSocket } from "../../lib/socket";

interface AuthContextValue {
    user: User | null;
    token: string | null;
    loading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (email: string, username: string, password: string) => Promise<void>;
    logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function useAuth(): AuthContextValue {
    const ctx = useContext(AuthContext);
    if (!ctx) throw new Error("useAuth deve ser usado dentro de <AuthProvider>");
    return ctx;
}

export function AuthProvider({ children }: { children: ReactNode}) {
    const [user, setUser] = useState<User | null>(null);
    const [token, setTokenState] = useState<string | null>(getToken());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const savedToken = getToken();
        if (!savedToken) {
            setLoading(false); // não tem token, não está logado.
            return;
        }

        api<User>("/me").then((me) => {
            setUser(me);
            setTokenState(savedToken);
            connectSocket();
        })
        .catch(() => {
            clearToken();
            setTokenState(null);
        })
        .finally(() => setLoading(false));
    }, []);

    async function login(email: string, password: string) {
        const res = await api<{ user: User; token: string }>("/auth/login", {
            method: "POST",
            body: JSON.stringify({ email, password }),
        });
        setToken(res.token);
        setTokenState(res.token);
        setUser(res.user);
        connectSocket();
    }

    async function register(email: string, username: string, password: string) {
        const res = await api<{ user: User; token: string }>("/auth/register", {
            method: "POST",
            body: JSON.stringify({ email, username, password }),
        });
        setToken(res.token);
        setTokenState(res.token);
        setUser(res.user);
        connectSocket();
    }

    function logout() {
        api("/auth/logout", { method: "POST" }).catch(() => {});
        clearToken();
        setTokenState(null);
        setUser(null);
        disconnectSocket();
        window.location.href = "/login"; 
    }

    return (
        <AuthContext.Provider value={{ user, token, loading, login, register, logout }}>
            {children} 
        </AuthContext.Provider>
    );
}