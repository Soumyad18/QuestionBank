import { QuestionCard } from "@/components/question-card";
import { CATEGORIES, DIFFICULTY } from "@/lib/categories";
import { MOCK_QUESTIONS } from "@/lib/mock-data";

export function QuestionsPage() {
  return (
    <section className="stack">
      <h1>Question Discovery</h1>
      <p className="muted">MVP includes keyword search + filter controls (wiring next).</p>

      <div className="card stack">
        <strong>Filters (UI scaffold)</strong>
        <div className="row muted">
          <span>Category: {CATEGORIES.join(", ")}</span>
        </div>
        <div className="row muted">
          <span>Difficulty: {DIFFICULTY.join(", ")}</span>
        </div>
      </div>

      <div className="stack">
        {MOCK_QUESTIONS.map((question) => (
          <QuestionCard key={question.id} question={question} />
        ))}
      </div>
    </section>
  );
}
