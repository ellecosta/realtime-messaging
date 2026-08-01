import { Link } from "react-router-dom";
import logo2 from "../../assets/logo2.png";
import logo3 from "../../assets/logo3.png";
import "./landing.css";

export function LandingPage() {
    return (
        <div className="landing">
            {/* Navbar */}
            <nav className="landing-nav">
                <div className="nav-logo">
                    <img src={logo2} alt="Hive" />
                </div>
            </nav>

            {/* Hero */}
            <section className="hero">
                <div className="hero-icon-wrapper">
                    <img src={logo3} alt="Hive" className="hero-icon" />
                </div>

                <h1 className="hero-headline">
                    One hive, infinite conversations.<br />
                    <span className="hero-highlight">Built for the buzz.</span>
                </h1>

                <p className="hero-description">
                    Crie servidores, organize canais por tema e troque mensagens
                    ao vivo com sua comunidade. Simples, rápido e gratuito.
                </p>

                <div className="hero-buttons">
                    <Link to="/register" className="btn-primary">Criar conta</Link>
                    <Link to="/login" className="btn-secondary">Já tenho conta</Link>
                </div>
            </section>

            <footer className="landing-footer">
                <p>Hive © 2026 · Feito com 💛 por Giselle</p>
            </footer>
        </div>
    );
}
