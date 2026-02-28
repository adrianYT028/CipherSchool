import axios from "axios";

// -------------------------------------------------------------------
// API client
// Centralised HTTP layer.  Every component talks to the backend
// through these functions rather than calling axios directly.  This
// keeps the base URL, headers, and error handling in one spot.
// -------------------------------------------------------------------

const api = axios.create({
    baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
    headers: { "Content-Type": "application/json" },
    timeout: 30000, // 30 seconds -- LLM calls can be slow
});

// Add auth token to requests if available
api.interceptors.request.use((config) => {
    const token = localStorage.getItem("ciphersql_token");
    if (token) {
        config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
});

// -- Auth ---------------------------------------------------------------

export const register = async (payload) => {
    // payload: { email, password, name }
    const { data } = await api.post("/auth/register", payload);
    return data;
};

export const login = async (payload) => {
    // payload: { email, password }
    const { data } = await api.post("/auth/login", payload);
    return data;
};

export const getCurrentUser = async () => {
    const { data } = await api.get("/auth/me");
    return data;
};

// -- Assignments --------------------------------------------------------

export const fetchAssignments = async () => {
    const { data } = await api.get("/assignments");
    return data;
};

export const fetchAssignment = async (id) => {
    const { data } = await api.get(`/assignments/${id}`);
    return data;
};

// -- Query execution ----------------------------------------------------

export const executeQuery = async (payload) => {
    // payload: { assignmentId, sessionId, sql }
    const { data } = await api.post("/query/execute", payload);
    return data;
};

// -- Hint ---------------------------------------------------------------

export const getHint = async (payload) => {
    // payload: { assignmentId, userQuery }
    const { data } = await api.post("/hint", payload);
    return data;
};

// -- Attempts -----------------------------------------------------------

export const saveAttempt = async (payload) => {
    // payload: { assignmentId, sql, success, error }
    const { data } = await api.post("/attempts", payload);
    return data;
};

export const getAttempts = async (assignmentId) => {
    const { data } = await api.get(`/attempts/${assignmentId}`);
    return data;
};

export const getAllAttempts = async () => {
    const { data } = await api.get("/attempts");
    return data;
};

export default api;
