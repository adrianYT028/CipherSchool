import { useNavigate } from "react-router-dom";
import "./AssignmentCard.scss";

// -------------------------------------------------------------------
// AssignmentCard
// Renders a single assignment on the listing page.  Clicking the
// card navigates to the attempt interface for that assignment.
// -------------------------------------------------------------------

// Map difficulty labels to a CSS modifier class so we can colour-code
// the badge without any runtime style objects.
const DIFFICULTY_CLASS = {
    Easy: "assignment-card__badge--easy",
    Medium: "assignment-card__badge--medium",
    Hard: "assignment-card__badge--hard",
};

function AssignmentCard({ assignment }) {
    const navigate = useNavigate();

    const handleClick = () => {
        navigate(`/attempt/${assignment._id}`);
    };

    return (
        <article
            className="assignment-card"
            onClick={handleClick}
            role="button"
            tabIndex={0}
            onKeyDown={(e) => {
                if (e.key === "Enter") handleClick();
            }}
        >
            <div className="assignment-card__header">
                <span
                    className={`assignment-card__badge ${DIFFICULTY_CLASS[assignment.difficulty] || ""
                        }`}
                >
                    {assignment.difficulty}
                </span>
            </div>
            <h3 className="assignment-card__title">{assignment.title}</h3>
            <p className="assignment-card__desc">{assignment.description}</p>
            <div className="assignment-card__footer">
                <span className="assignment-card__cta">Start practicing</span>
            </div>
        </article>
    );
}

export default AssignmentCard;
