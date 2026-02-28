import "./QuestionPanel.scss";

const DIFFICULTY_CLASS = {
    Easy: "question-panel__difficulty--easy",
    Medium: "question-panel__difficulty--medium",
    Hard: "question-panel__difficulty--hard",
};

function QuestionPanel({ assignment }) {
    if (!assignment) return null;

    return (
        <section className="question-panel">
            <div className="question-panel__header">
                <h2 className="question-panel__title">{assignment.title}</h2>
                <span
                    className={`question-panel__difficulty ${DIFFICULTY_CLASS[assignment.difficulty] || ""
                        }`}
                >
                    {assignment.difficulty}
                </span>
            </div>
            <p className="question-panel__question">{assignment.question}</p>
        </section>
    );
}

export default QuestionPanel;
