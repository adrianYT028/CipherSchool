import "./ResultsPanel.scss";

// -------------------------------------------------------------------
// ResultsPanel
// Displays query output as a formatted table or shows an error
// message.  Has three visual states: empty (no query run yet),
// loading (spinner), and populated (table or error).
// -------------------------------------------------------------------

function ResultsPanel({ columns, rows, error, isLoading }) {
    // Nothing has been run yet.
    if (!isLoading && !error && !columns) {
        return (
            <div className="results-panel results-panel--empty">
                <p className="results-panel__placeholder">
                    Run a query to see results here.
                </p>
            </div>
        );
    }

    return (
        <div className="results-panel">
            <h3 className="results-panel__heading">Results</h3>

            {/* Loading spinner */}
            {isLoading && (
                <div className="results-panel__loader">
                    <div className="results-panel__spinner" />
                    <span>Executing query...</span>
                </div>
            )}

            {/* Error message */}
            {!isLoading && error && (
                <div className="results-panel__error">
                    <span className="results-panel__error-label">Error</span>
                    <pre className="results-panel__error-text">{error}</pre>
                </div>
            )}

            {/* Results table */}
            {!isLoading && !error && columns && (
                <div className="results-panel__table-wrapper">
                    <table className="results-panel__table">
                        <thead>
                            <tr>
                                {columns.map((col) => (
                                    <th key={col} className="results-panel__th">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {rows && rows.length > 0 ? (
                                rows.map((row, rowIdx) => (
                                    <tr key={rowIdx} className="results-panel__tr">
                                        {columns.map((col) => (
                                            <td key={col} className="results-panel__td">
                                                {row[col] === null ? "NULL" : String(row[col])}
                                            </td>
                                        ))}
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td
                                        className="results-panel__td results-panel__td--empty"
                                        colSpan={columns.length}
                                    >
                                        Query returned no rows.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                    {rows && rows.length > 0 && (
                        <p className="results-panel__row-count">
                            {rows.length} row{rows.length !== 1 ? "s" : ""} returned
                        </p>
                    )}
                </div>
            )}
        </div>
    );
}

export default ResultsPanel;
