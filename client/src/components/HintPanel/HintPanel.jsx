import { useState } from "react";
import { getHint } from "../../api/apiClient";
import "./HintPanel.scss";

function HintPanel({ assignmentId, userQuery }) {
    const [hint, setHint] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [visible, setVisible] = useState(false);

    const handleGetHint = async () => {
        setLoading(true);
        setError(null);

        try {
            const data = await getHint({ assignmentId, userQuery });
            setHint(data.hint);
            setVisible(true);
        } catch (err) {
            const message =
                err.response?.data?.error || "Failed to fetch hint. Please try again.";
            setError(message);
            setVisible(true);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="hint-panel">
            <button
                className="hint-panel__trigger"
                onClick={handleGetHint}
                disabled={loading}
            >
                {loading ? "Thinking..." : "Get Hint"}
            </button>

            {visible && (
                <div className="hint-panel__callout">
                    <div className="hint-panel__callout-header">
                        <span className="hint-panel__callout-label">Hint</span>
                        <button
                            className="hint-panel__close"
                            onClick={() => setVisible(false)}
                            aria-label="Close hint"
                        >
                            Close
                        </button>
                    </div>
                    {error ? (
                        <p className="hint-panel__error">{error}</p>
                    ) : (
                        <p className="hint-panel__text">{hint}</p>
                    )}
                </div>
            )}
        </div>
    );
}

export default HintPanel;
