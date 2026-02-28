import Editor from "@monaco-editor/react";
import "./SqlEditor.scss";

function SqlEditor({ value, onChange, onRun, isRunning }) {
    const handleEditorChange = (newValue) => {
        onChange(newValue || "");
    };

    const handleEditorMount = (editor, monaco) => {
        editor.addCommand(
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
