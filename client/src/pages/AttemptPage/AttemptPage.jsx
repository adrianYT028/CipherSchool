import { useState, useEffect, useCallback } from "react";
import { useParams, Link } from "react-router-dom";
import QuestionPanel from "../../components/QuestionPanel/QuestionPanel";
import DataViewer from "../../components/DataViewer/DataViewer";
import SqlEditor from "../../components/SqlEditor/SqlEditor";
import ResultsPanel from "../../components/ResultsPanel/ResultsPanel";
import HintPanel from "../../components/HintPanel/HintPanel";
import { fetchAssignment, executeQuery, saveAttempt, getAttempts } from "../../api/apiClient";
import { useAuth } from "../../context/AuthContext";
import "./AttemptPage.scss";

function getSessionId() {
    let id = localStorage.getItem("ciphersql_session");
    if (!id) {
        id = crypto.randomUUID();
        localStorage.setItem("ciphersql_session", id);
    }
    return id;
}

function AttemptPage() {
    const { id } = useParams();
    const { isAuthenticated, loading: authLoading } = useAuth();

    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const [sql, setSql] = useState("SELECT ");
    const [queryResult, setQueryResult] = useState({
        columns: null,
        rows: null,
        error: null,
    });
    const [running, setRunning] = useState(false);

    const [attempts, setAttempts] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    useEffect(() => {
        loadAssignment();
    }, [id]);

    useEffect(() => {
        if (!authLoading && isAuthenticated) {
            loadAttempts();
        }
    }, [id, authLoading, isAuthenticated]);

    const loadAssignment = async () => {
        setLoading(true);
        setError(null);
        try {
            const data = await fetchAssignment(id);
            setAssignment(data);
        } catch (err) {
            setError("Could not load assignment. Check the URL or server.");
            console.error("[AttemptPage]", err);
        } finally {
            setLoading(false);
        }
    };

    const loadAttempts = async () => {
        try {
            const data = await getAttempts(id);
            setAttempts(data.attempts || []);
        } catch (err) {
            console.error("[AttemptPage] Failed to load attempts:", err);
        }
    };

    const handleRunQuery = useCallback(async () => {
        if (!sql.trim() || running) return;
        setRunning(true);
        setQueryResult({ columns: null, rows: null, error: null });

        let success = false;
        let errorMsg = null;

        try {
            const result = await executeQuery({
                assignmentId: id,
                sessionId: getSessionId(),
                sql,
            });
            setQueryResult({
                columns: result.columns,
                rows: result.rows,
                error: null,
            });
            success = true;
        } catch (err) {
            errorMsg = err.response?.data?.error || "An unexpected error occurred.";
            setQueryResult({ columns: null, rows: null, error: errorMsg });
        } finally {
            setRunning(false);
        }

        if (isAuthenticated) {
            try {
                await saveAttempt({
                    assignmentId: id,
                    sql,
                    success,
                    error: errorMsg,
                });
                loadAttempts();
            } catch (err) {
                console.error("[AttemptPage] Failed to save attempt:", err);
            }
        }
    }, [sql, running, id, isAuthenticated]);

    if (loading) {
        return (
            <main className="attempt-page attempt-page--loading">
                <div className="attempt-page__spinner" />
                <p>Loading assignment...</p>
            </main>
        );
    }

    if (error) {
        return (
            <main className="attempt-page attempt-page--error">
                <p>{error}</p>
                <Link to="/" className="attempt-page__back-link">
                    Back to assignments
                </Link>
            </main>
        );
    }

    return (
        <main className="attempt-page">
            <div className="attempt-page__layout">
                {/* Left column: question and sample data */}
                <aside className="attempt-page__sidebar">
                    <QuestionPanel assignment={assignment} />
                    <DataViewer sampleTables={assignment?.sampleTables} />
                    <HintPanel assignmentId={id} userQuery={sql} />

                    {/* Attempt history for logged-in users */}
                    {isAuthenticated && attempts.length > 0 && (
                        <div className="attempt-page__history">
                            <button
                                className="attempt-page__history-toggle"
                                onClick={() => setShowHistory(!showHistory)}
                            >
                                {showHistory ? "Hide" : "Show"} History ({attempts.length})
                            </button>
                            {showHistory && (
                                <div className="attempt-page__history-list">
                                    {attempts.map((attempt, idx) => (
                                        <div
                                            key={attempt._id || idx}
                                            className={`attempt-page__history-item ${
                                                attempt.success
                                                    ? "attempt-page__history-item--success"
                                                    : "attempt-page__history-item--error"
                                            }`}
                                            onClick={() => setSql(attempt.sql)}
                                        >
                                            <span className="attempt-page__history-time">
                                                {new Date(attempt.createdAt).toLocaleTimeString()}
                                            </span>
                                            <span className="attempt-page__history-status">
                                                {attempt.success ? "✓" : "✗"}
                                            </span>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </aside>

                {/* Right column: editor and results */}
                <section className="attempt-page__workspace">
                    <div className="attempt-page__editor">
                        <SqlEditor
                            value={sql}
                            onChange={setSql}
                            onRun={handleRunQuery}
                            isRunning={running}
                        />
                    </div>
                    <div className="attempt-page__results">
                        <ResultsPanel
                            columns={queryResult.columns}
                            rows={queryResult.rows}
                            error={queryResult.error}
                            isLoading={running}
                        />
                    </div>
                </section>
            </div>
        </main>
    );
}

export default AttemptPage;
