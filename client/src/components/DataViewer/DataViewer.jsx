import { useState } from "react";
import "./DataViewer.scss";

function DataViewer({ sampleTables }) {
    if (!sampleTables || sampleTables.length === 0) {
        return null;
    }

    return (
        <section className="data-viewer">
            <h3 className="data-viewer__heading">Sample Data</h3>
            <div className="data-viewer__tables">
                {sampleTables.map((table, idx) => (
                    <TableBlock key={idx} table={table} />
                ))}
            </div>
        </section>
    );
}

function TableBlock({ table }) {
    const [expanded, setExpanded] = useState(true);

    return (
        <div className="data-viewer__block">
            <button
                className="data-viewer__table-header"
                onClick={() => setExpanded((prev) => !prev)}
                aria-expanded={expanded}
            >
                <span className="data-viewer__table-name">{table.tableName}</span>
                <span className="data-viewer__toggle">
                    {expanded ? "Collapse" : "Expand"}
                </span>
            </button>

            {expanded && (
                <div className="data-viewer__table-wrapper">
                    <table className="data-viewer__table">
                        <thead>
                            <tr>
                                {table.columns.map((col) => (
                                    <th key={col} className="data-viewer__th">
                                        {col}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {table.rows.map((row, rowIdx) => (
                                <tr key={rowIdx} className="data-viewer__tr">
                                    {row.map((cell, cellIdx) => (
                                        <td key={cellIdx} className="data-viewer__td">
                                            {cell === null ? "NULL" : String(cell)}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    );
}

export default DataViewer;
