import { Routes, Route, Navigate } from 'react-router-dom'
import { LoginPage } from './features/auth/LoginPage'
import { LandingPage } from './features/landing/LandingPage'
import { RegisterPage } from './features/auth/RegisterPage'
import { RequireAuth } from './features/auth/RequireAuth'
import { InvitePage } from './features/invites/InvitePage'
import { ChatPage } from './features/chat/ChatPage'
import './App.css'

function App() {
    return (
        <Routes>
            <Route path="/welcome" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/invite/:code" element={<InvitePage />} />
            <Route path="/" element={<RequireAuth><ChatPage /></RequireAuth>} />
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    );
}

export default App
