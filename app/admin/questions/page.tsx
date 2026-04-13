import { CATEGORIES, DIFFICULTY } from "@/lib/categories";

export default function AdminQuestionsPage() {
  return (
    <section className="stack">
      <h1>Admin · Manage Questions</h1>
      <p className="muted">MVP flow: create question → AI tag suggestions → edit tags → save.</p>

      <div className="card stack">
        <strong>Question form scaffold</strong>
        <ul>
          <li>Text</li>
          <li>Company</li>
          <li>Round (screening, l1, l2, hr)</li>
          <li>Date + interviewer (optional)</li>
          <li>Category ({CATEGORIES.join(", ")})</li>
          <li>Difficulty ({DIFFICULTY.join(", ")})</li>
          <li>AI tags (editable)</li>
        </ul>
      </div>

      <div className="card">
        <strong>Supabase setup needed next:</strong>
        <p className="muted">
          Provide Supabase project URL, anon key, and preferred auth provider so we can wire
          login + question persistence.
        </p>
      </div>
    </section>
  );
}
