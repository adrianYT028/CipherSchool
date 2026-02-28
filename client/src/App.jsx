import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import Header from "./components/Header/Header";
import AssignmentListPage from "./pages/AssignmentListPage/AssignmentListPage";
import AttemptPage from "./pages/AttemptPage/AttemptPage";
import AuthPage from "./pages/AuthPage/AuthPage";
import "./styles/main.scss";


function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Header />
                <Routes>
                    <Route path="/" element={<AssignmentListPage />} />
                    <Route path="/attempt/:id" element={<AttemptPage />} />
                    <Route path="/auth" element={<AuthPage />} />
                </Routes>
            </BrowserRouter>
        </AuthProvider>
    );
}

export default App;
