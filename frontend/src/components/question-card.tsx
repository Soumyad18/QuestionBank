import React from "react";
import type { Question } from "@/lib/types";
import { ROUND_LABELS, ROUND_COLORS } from "@/lib/categories";

const RELEVANCY_COLORS: Record<string, string> = {
  CRITICAL: "#f87171",
  HIGH:     "#fb923c",
  MODERATE: "#facc15",
  LOW:      "#888888",
};

interface QuestionCardProps {
  question: Question;
  onEdit?: (question: Question) => void;
  onDelete?: (question: Question) => void;
  showEditButton?: boolean;
}

export function QuestionCard({ question, onEdit, onDelete, showEditButton }: QuestionCardProps) {
  const relevancyColor = question.relevancyLabel ? RELEVANCY_COLORS[question.relevancyLabel] : null;
  const latestDate = question.sessions[0]?.interviewDate ?? null;

  return (
    <article className="card" style={{ display: "grid", gap: "var(--spacing-md)", padding: "var(--spacing-md)" }}>
      {/* Header Row — companies + rounds + category */}
      <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-start", gap: "var(--spacing-md)" }}>
        <div className="row" style={{ flexWrap: "wrap", gap: "var(--spacing-sm)", flex: 1 }}>
          {question.sessions.map((s, i) => (
            <React.Fragment key={i}>
              <span className="badge" style={{ color: "var(--accent-cyan)", borderColor: "var(--accent-cyan)" }}>
                {s.companyName}
              </span>
              <span className="badge" style={{ color: ROUND_COLORS[s.round], borderColor: ROUND_COLORS[s.round] }}>
                {ROUND_LABELS[s.round]}
              </span>
            </React.Fragment>
          ))}
          <span className="badge">{question.category}</span>
        </div>

        {/* Right column — importance + date stacked + edit/del */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "var(--spacing-sm)", flexShrink: 0 }}>
          <div className="row" style={{ gap: "var(--spacing-sm)" }}>
            {question.relevancyLabel && relevancyColor && (
              <span className="badge" style={{ color: relevancyColor, borderColor: relevancyColor, fontSize: "10px" }}>
                IMPORTANCE: {question.relevancyLabel}
              </span>
            )}
            {showEditButton && (onEdit || onDelete) && (
              <>
                {onEdit && (
                  <button className="badge card-btn-edit" onClick={() => onEdit(question)}
                    style={{ border: "1px solid #4ade80", color: "#4ade80", cursor: "pointer", background: "transparent" }}>
                    [EDIT]
                  </button>
                )}
                {onDelete && (
                  <button className="badge card-btn-del" onClick={() => onDelete(question)}
                    style={{ border: "1px solid #f87171", color: "#f87171", cursor: "pointer", background: "transparent" }}>
                    [DEL]
                  </button>
                )}
              </>
            )}
          </div>
          {latestDate && (
            <span className="muted" style={{ fontSize: "11px", letterSpacing: "0.05em", fontFamily: "var(--font-mono)" }}>
              LAST ASKED: {latestDate}
            </span>
          )}
        </div>
      </div>

      {/* Question Text */}
      <p style={{ margin: 0, fontFamily: "var(--font-body)", fontSize: "15px", lineHeight: 1.7 }}>
        {question.text}
      </p>

      {/* Tags */}
      <div className="row" style={{ flexWrap: "wrap", gap: "var(--spacing-sm)" }}>
        {question.tags.map((tag) => (
          <span key={tag} className="badge" style={{ fontSize: "10px", opacity: 0.7 }}>
            #{tag}
          </span>
        ))}
      </div>
    </article>
  );
}
