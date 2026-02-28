import Editor from "@monaco-editor/react";
import "./SqlEditor.scss";

// -------------------------------------------------------------------
// SqlEditor
// Wraps the Monaco editor configured for SQL.  We disable the minimap
// and keep the interface minimal so the focus stays on the query.
// The "Run Query" button lives here because it's directly tied to the
// editor content.
// -------------------------------------------------------------------

function SqlEditor({ value, onChange, onRun, isRunning }) {
    const handleEditorChange = (newValue) => {
        onChange(newValue || "");
    };

    // Allow Ctrl+Enter (or Cmd+Enter on Mac) to run the query.
    const handleEditorMount = (editor, monaco) => {
        editor.addCommand(
            // Monaco keybinding for Ctrl+Enter
            // eslint-disable-next-line no-bitwise
            monaco.KeyMod.CtrlCmd | monaco.KeyCode.Enter,
            () => {
                if (onRun) onRun();
            }
        );
    };

    return (
        <div className="sql-editor">
            <div className="sql-editor__toolbar">
                <span className="sql-editor__label">SQL Query</span>
                <button
                    className="sql-editor__run-btn"
                    onClick={onRun}
                    disabled={isRunning}
                >
                    {isRunning ? "Running..." : "Run Query"}
                </button>
            </div>
            <div className="sql-editor__editor-wrapper">
                <Editor
                    height="100%"
                    language="sql"
                    theme="vs-dark"
                    value={value}
                    onChange={handleEditorChange}
                    onMount={handleEditorMount}
                    options={{
                        minimap: { enabled: false },
                        fontSize: 14,
                        fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                        lineNumbers: "on",
                        scrollBeyondLastLine: false,
                        wordWrap: "on",
                        padding: { top: 12 },
                        suggestOnTriggerCharacters: true,
                        tabSize: 2,
                        automaticLayout: true,
                    }}
                />
            </div>
        </div>
    );
}

export default SqlEditor;
