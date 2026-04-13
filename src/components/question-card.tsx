import type { Question } from "@/lib/types";
import { ROUND_LABELS } from "@/lib/categories";

export function QuestionCard({ question }: { question: Question }) {
  return (
    <article className="card" style={{ display: "grid", gap: "var(--spacing-sm)" }}>
      {/* Header Row: Company + Round + Date */}
      <div className="row" style={{ justifyContent: "space-between" }}>
        <div className="row">
          <span className="badge" style={{ color: "var(--accent-cyan)", borderColor: "var(--accent-cyan)" }}>
            {question.company}
          </span>
          <span className="badge">{ROUND_LABELS[question.round]}</span>
          <span className="badge">{question.difficulty.toUpperCase()}</span>
        </div>
        <span className="muted" style={{ fontSize: "11px" }}>{question.date}</span>
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
