const KEY = "auth_token";

export function getToken(): string | null {
    return localStorage.getItem(KEY);
}

export function setToken(token: string): void {
    return localStorage.setItem(KEY, token);
}

export function clearToken(): void {
    return localStorage.removeItem(KEY);
}