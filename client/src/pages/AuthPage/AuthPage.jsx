import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./AuthPage.scss";

function AuthPage() {
    const [mode, setMode] = useState("login");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);

    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setLoading(true);

        try {
            if (mode === "login") {
                await login(email, password);
            } else {
                if (!name.trim()) {
                    setError("Name is required.");
                    setLoading(false);
                    return;
                }
                await register(email, password, name);
            }
            navigate("/");
        } catch (err) {
            const message = err.response?.data?.error || "Something went wrong.";
            setError(message);
        } finally {
            setLoading(false);
        }
    };

    return (
        <main className="auth-page">
            <div className="auth-page__card">
                <h1 className="auth-page__title">
                    {mode === "login" ? "Welcome Back" : "Create Account"}
                </h1>
                <p className="auth-page__subtitle">
                    {mode === "login"
                        ? "Sign in to continue practicing SQL"
                        : "Join CipherSQLStudio to track your progress"}
                </p>

                <div className="auth-page__tabs">
                    <button
                        className={`auth-page__tab ${mode === "login" ? "auth-page__tab--active" : ""}`}
                        onClick={() => setMode("login")}
                    >
                        Login
                    </button>
                    <button
                        className={`auth-page__tab ${mode === "signup" ? "auth-page__tab--active" : ""}`}
                        onClick={() => setMode("signup")}
                    >
                        Sign Up
                    </button>
                </div>

                {error && <div className="auth-page__error">{error}</div>}

                <form className="auth-page__form" onSubmit={handleSubmit}>
                    {mode === "signup" && (
                        <div className="auth-page__field">
                            <label className="auth-page__label" htmlFor="name">
                                Name
                            </label>
                            <input
                                id="name"
                                type="text"
                                className="auth-page__input"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Your name"
                                autoComplete="name"
                            />
                        </div>
                    )}

                    <div className="auth-page__field">
                        <label className="auth-page__label" htmlFor="email">
                            Email
                        </label>
                        <input
                            id="email"
                            type="email"
                            className="auth-page__input"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="you@example.com"
                            required
                            autoComplete="email"
                        />
                    </div>

                    <div className="auth-page__field">
                        <label className="auth-page__label" htmlFor="password">
                            Password
                        </label>
                        <input
                            id="password"
                            type="password"
                            className="auth-page__input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            placeholder="••••••••"
                            required
                            minLength={6}
                            autoComplete={mode === "login" ? "current-password" : "new-password"}
                        />
                    </div>

                    <button
                        type="submit"
                        className="auth-page__submit"
                        disabled={loading}
                    >
                        {loading
                            ? "Please wait..."
                            : mode === "login"
                                ? "Sign In"
                                : "Create Account"}
                    </button>
                </form>

                <p className="auth-page__footer">
                    <Link to="/" className="auth-page__link">
                        Continue as guest
                    </Link>
                </p>
            </div>
        </main>
    );
}

export default AuthPage;
