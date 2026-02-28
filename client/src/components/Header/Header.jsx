import { Link } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import "./Header.scss";

// -------------------------------------------------------------------
// Header
// Sticky top bar with the app title and a small nav link back to the
// assignment list.  Uses a frosted-glass effect to stay readable when
// content scrolls underneath.  Shows login/logout based on auth state.
// -------------------------------------------------------------------

function Header() {
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <header className="header">
            <div className="header__inner">
                <Link to="/" className="header__logo">
                    CipherSQLStudio
                </Link>
                <nav className="header__nav">
                    <Link to="/" className="header__nav-link">
                        Assignments
                    </Link>
                    {isAuthenticated ? (
                        <>
                            <span className="header__user">
                                {user?.name}
                            </span>
                            <button
                                className="header__nav-link header__logout"
                                onClick={logout}
                            >
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/auth" className="header__nav-link header__login">
                            Login
                        </Link>
                    )}
                </nav>
            </div>
        </header>
    );
}

export default Header;
