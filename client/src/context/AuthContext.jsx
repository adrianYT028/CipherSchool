import { createContext, useContext, useState, useEffect } from "react";
import { getCurrentUser, login as apiLogin, register as apiRegister } from "../api/apiClient";

// -------------------------------------------------------------------
// AuthContext
// Manages user authentication state across the app.
// Provides login, register, logout methods and current user.
// -------------------------------------------------------------------

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    // Check for existing token on mount
    useEffect(() => {
        checkAuth();
    }, []);

    const checkAuth = async () => {
        const token = localStorage.getItem("ciphersql_token");
        if (!token) {
            setLoading(false);
            return;
        }

        try {
            const data = await getCurrentUser();
            setUser(data.user);
        } catch (err) {
            // Token invalid, clear it
            localStorage.removeItem("ciphersql_token");
        } finally {
            setLoading(false);
        }
    };

    const login = async (email, password) => {
        const data = await apiLogin({ email, password });
        localStorage.setItem("ciphersql_token", data.token);
        setUser(data.user);
        return data;
    };

    const register = async (email, password, name) => {
        const data = await apiRegister({ email, password, name });
        localStorage.setItem("ciphersql_token", data.token);
        setUser(data.user);
        return data;
    };

    const logout = () => {
        localStorage.removeItem("ciphersql_token");
        setUser(null);
    };

    const value = {
        user,
        loading,
        isAuthenticated: !!user,
        login,
        register,
        logout,
    };

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    );
}

export function useAuth() {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
