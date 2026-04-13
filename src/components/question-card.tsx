import type { Question } from "@/lib/types";
import { ROUND_LABELS, ROUND_COLORS, DIFFICULTY_COLORS } from "@/lib/categories";

interface QuestionCardProps {
  question: Question;
  onEdit?: (question: Question) => void;
  showEditButton?: boolean;
}

export function QuestionCard({ question, onEdit, showEditButton }: QuestionCardProps) {
  const roundColor = ROUND_COLORS[question.round];
  const diffColor = DIFFICULTY_COLORS[question.difficulty];

  return (
    <article className="card" style={{ display: "grid", gap: "var(--spacing-sm)" }}>
      {/* Header Row: Company + Round + Difficulty + Date */}
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="row">
          <span className="badge" style={{ color: "var(--accent-cyan)", borderColor: "var(--accent-cyan)" }}>
            {question.company}
          </span>
          <span className="badge" style={{ color: roundColor, borderColor: roundColor }}>
            {ROUND_LABELS[question.round]}
          </span>
          <span className="badge" style={{ color: diffColor, borderColor: diffColor }}>
            {question.difficulty.toUpperCase()}
          </span>
        </div>
        <div className="row">
          <span className="muted" style={{ fontSize: "11px" }}>{question.date}</span>
          {showEditButton && onEdit && (
            <button
              className="muted"
              onClick={() => onEdit(question)}
              style={{
                background: "none",
                border: "1px solid var(--border-color)",
                cursor: "pointer",
                padding: "2px 8px",
                fontFamily: "var(--font-mono)",
                fontSize: "10px",
              }}
            >
              [EDIT]
            </button>
          )}
        </div>
      </div>

      {/* Question Text */}
      <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "15px", lineHeight: 1.7 }}>
        {question.text}
      </p>

      {/* Tags Row */}
      <div className="row" style={{ marginTop: "4px" }}>
        {question.tags.map((tag) => (
          <span key={tag} className="badge" style={{ fontSize: "10px", opacity: 0.7 }}>
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
}
