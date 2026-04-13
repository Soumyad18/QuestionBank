import Link from "next/link";

export default function HomePage() {
  return (
    <section className="stack">
      <h1>Interview Question Bank</h1>
      <p className="muted">
        MVP scaffold ready. Focus: collection, organization, and discovery of real interview
        questions.
      </p>
      <div className="row">
        <Link href="/questions">Browse Questions</Link>
        <span>•</span>
        <Link href="/admin/questions">Admin Panel</Link>
      </div>
    </section>
  );
}
