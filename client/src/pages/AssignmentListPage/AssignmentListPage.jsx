import { useState, useEffect } from "react";
import AssignmentCard from "../../components/AssignmentCard/AssignmentCard";
import { fetchAssignments } from "../../api/apiClient";
import "./AssignmentListPage.scss";

const DIFFICULTY_OPTIONS = ["All", "Easy", "Medium", "Hard"];

function AssignmentListPage() {
    const [assignments, setAssignments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [filter, setFilter] = useState("All");

    useEffect(() => {
        loadAssignments();
    }, []);

    const loadAssignments = async () => {
        try {
            const data = await fetchAssignments();
            setAssignments(data);
        } catch (err) {
            setError("Failed to load assignments. Is the server running?");
            console.error("[AssignmentListPage]", err);
        } finally {
            setLoading(false);
        }
    };

    const displayed =
        filter === "All"
            ? assignments
            : assignments.filter((a) => a.difficulty === filter);

    return (
        <main className="assignment-list">
            <section className="assignment-list__hero">
                <h1 className="assignment-list__title">SQL Practice Assignments</h1>
                <p className="assignment-list__subtitle">
                    Choose an assignment below and practice writing SQL queries in a safe
                    sandbox environment.
                </p>
            </section>

            <div className="assignment-list__filters">
                {DIFFICULTY_OPTIONS.map((opt) => (
                    <button
                        key={opt}
                        className={`assignment-list__filter-btn ${filter === opt ? "assignment-list__filter-btn--active" : ""
                            }`}
                        onClick={() => setFilter(opt)}
                    >
                        {opt}
                    </button>
                ))}
            </div>

            {loading && (
                <div className="assignment-list__status">
                    <div className="assignment-list__spinner" />
                    <p>Loading assignments...</p>
                </div>
            )}

            {!loading && error && (
                <div className="assignment-list__status assignment-list__status--error">
                    <p>{error}</p>
                </div>
            )}

            {!loading && !error && displayed.length === 0 && (
                <div className="assignment-list__status">
                    <p>No assignments match the selected filter.</p>
                </div>
            )}

            {!loading && !error && displayed.length > 0 && (
                <div className="assignment-list__grid">
                    {displayed.map((a) => (
                        <AssignmentCard key={a._id} assignment={a} />
                    ))}
                </div>
            )}
        </main>
    );
}

export default AssignmentListPage;
