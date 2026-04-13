import type { Question } from "@/lib/types";

export function QuestionCard({ question }: { question: Question }) {
  return (
    <article className="card stack">
      <div className="row">
        <span className="badge">{question.category}</span>
        <span className="badge">{question.difficulty}</span>
        <span className="muted">
          {question.company} • {question.round.toUpperCase()}
        </span>
      </div>
      <p>{question.text}</p>
      <div className="row">
        {question.tags.map((tag) => (
          <span key={tag} className="badge">
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
}
