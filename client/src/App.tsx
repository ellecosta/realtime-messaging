import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './features/auth/LoginPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { RequireAuth } from './features/auth/RequireAuth'
import { InvitePage } from './features/invites/InvitePage'
import './App.css'

function ChatPlaceholder() {
    return <div>Chat — implemente o layout aqui (§9 do frontend.md)</div>;
}

function App() {
    return (
        <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/invite/:code" element={<InvitePage />} />
            <Route path="/" element={<RequireAuth><ChatPlaceholder /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App
