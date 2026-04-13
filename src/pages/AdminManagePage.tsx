import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { QuestionCard } from "@/components/question-card";
import { CATEGORIES, ROUNDS, ROUND_LABELS, DIFFICULTY } from "@/lib/categories";
import { MOCK_QUESTIONS, MOCK_COMPANIES, MOCK_TAGS } from "@/lib/mock-data";
import { useAuth } from "@/lib/auth";
import type { Question } from "@/lib/types";
import type { Category, Difficulty, Round } from "@/lib/categories";

export function AdminManagePage() {
  const { user, logout } = useAuth();

  // Search / Filter state
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRound, setSelectedRound] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedTag, setSelectedTag] = useState("");

  // Edit modal state
  const [editingQuestion, setEditingQuestion] = useState<Question | null>(null);
  const [editText, setEditText] = useState("");
  const [editCompany, setEditCompany] = useState("");
  const [editRound, setEditRound] = useState<Round>("l1");
  const [editCategory, setEditCategory] = useState<Category>("General");
  const [editDifficulty, setEditDifficulty] = useState<Difficulty>("medium");
  const [editTags, setEditTags] = useState("");
  const [saveStatus, setSaveStatus] = useState<"" | "SAVED">("");

  // Filtering
  const filteredQuestions = useMemo(() => {
    return MOCK_QUESTIONS.filter((q: Question) => {
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesText = q.text.toLowerCase().includes(query);
        const matchesTags = q.tags.some(t => t.toLowerCase().includes(query));
        const matchesCompany = q.company.toLowerCase().includes(query);
        if (!matchesText && !matchesTags && !matchesCompany) return false;
      }
      if (selectedCompany && q.company !== selectedCompany) return false;
      if (selectedRound && q.round !== selectedRound) return false;
      if (selectedCategory && q.category !== selectedCategory) return false;
      if (selectedDifficulty && q.difficulty !== selectedDifficulty) return false;
      if (selectedTag && !q.tags.includes(selectedTag)) return false;
      return true;
    });
  }, [searchQuery, selectedCompany, selectedRound, selectedCategory, selectedDifficulty, selectedTag]);

  const clearFilters = () => {
    setSearchQuery("");
    setSelectedCompany("");
    setSelectedRound("");
    setSelectedCategory("");
    setSelectedDifficulty("");
    setSelectedTag("");
  };

  const hasActiveFilters = selectedCompany || selectedRound || selectedCategory || selectedDifficulty || selectedTag || searchQuery;

  // Edit handlers
  const openEditor = (question: Question) => {
    setEditingQuestion(question);
    setEditText(question.text);
    setEditCompany(question.company);
    setEditRound(question.round);
    setEditCategory(question.category);
    setEditDifficulty(question.difficulty);
    setEditTags(question.tags.join(", "));
    setSaveStatus("");
  };

  const closeEditor = () => {
    setEditingQuestion(null);
    setSaveStatus("");
  };

  const handleSave = () => {
    // Mock save — in production this would hit Supabase
    setSaveStatus("SAVED");
    setTimeout(() => {
      closeEditor();
    }, 1200);
  };

  return (
    <div className="container" style={{ minHeight: "100vh" }}>
      {/* Header Bar */}
      <header className="row" style={{ justifyContent: "space-between", paddingBottom: "var(--spacing-md)", borderBottom: "1px solid var(--border-color)", marginBottom: "var(--spacing-lg)" }}>
        <div className="row">
          <span className="badge">ADMIN_NODE</span>
          <span className="muted" style={{ marginLeft: "8px" }}>[{user?.email}]</span>
        </div>
        <div className="row">
          <Link to="/admin/questions" className="btn" style={{ padding: "6px 12px", fontSize: "11px" }}>
            [DIGEST]
          </Link>
          <button onClick={logout} className="muted" style={{ background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
            [TERM_SESSION]
          </button>
        </div>
      </header>

      {/* Page Title */}
      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <h1 style={{ fontSize: "2.5rem" }}>Question Management</h1>
        <p className="muted">{filteredQuestions.length} records / {MOCK_QUESTIONS.length} total — search, filter, edit questions and tags</p>
      </div>

      {/* Search */}
      <div className="structural-grid" style={{ marginBottom: "var(--spacing-md)" }}>
        <div className="grid-cell" style={{ padding: "var(--spacing-md)" }}>
          <div className="input-group">
            <label className="input-label">SEARCH QUERY</label>
            <input
              type="text"
              className="input-field"
              placeholder="Search by keyword, company, or tag..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ fontSize: "16px" }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="structural-grid" style={{ marginBottom: "var(--spacing-lg)" }}>
        <div className="grid-cell">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: "var(--spacing-md)" }}>
            <span className="muted" style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>
              ▼ FILTER_CONTROLS
            </span>
            {hasActiveFilters && (
              <button className="muted" onClick={clearFilters} style={{ background: "none", border: "1px solid var(--border-color)", cursor: "pointer", padding: "4px 8px", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--accent-cyan)" }}>
                [CLEAR ALL]
              </button>
            )}
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "var(--spacing-md)" }}>
            <div className="input-group">
              <label className="input-label">Company</label>
              <select className="input-field" value={selectedCompany} onChange={(e) => setSelectedCompany(e.target.value)}>
                <option value="">ALL</option>
                {MOCK_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Round</label>
              <select className="input-field" value={selectedRound} onChange={(e) => setSelectedRound(e.target.value)}>
                <option value="">ALL</option>
                {ROUNDS.map(r => <option key={r} value={r}>{ROUND_LABELS[r]}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Category</label>
              <select className="input-field" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                <option value="">ALL</option>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Difficulty</label>
              <select className="input-field" value={selectedDifficulty} onChange={(e) => setSelectedDifficulty(e.target.value)}>
                <option value="">ALL</option>
                {DIFFICULTY.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
              </select>
            </div>
            <div className="input-group">
              <label className="input-label">Tag</label>
              <select className="input-field" value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)}>
                <option value="">ALL</option>
                {MOCK_TAGS.map(t => <option key={t} value={t}>#{t}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Question List with [EDIT] buttons */}
      {filteredQuestions.length === 0 ? (
        <div className="structural-grid">
          <div className="grid-cell" style={{ textAlign: "center", padding: "var(--spacing-xl)" }}>
            <p className="muted" style={{ fontSize: "16px" }}>NO_RESULTS: Query returned 0 records.</p>
            <button className="btn" onClick={clearFilters} style={{ marginTop: "var(--spacing-md)" }}>[RESET FILTERS]</button>
          </div>
        </div>
      ) : (
        <div className="stack">
          {filteredQuestions.map((question) => (
            <QuestionCard
              key={question.id}
              question={question}
              showEditButton={true}
              onEdit={openEditor}
            />
          ))}
        </div>
      )}

      {/* ── Edit Modal Overlay ── */}
      {editingQuestion && (
        <div style={{
          position: "fixed", inset: 0,
          background: "rgba(0,0,0,0.85)",
          display: "flex", alignItems: "center", justifyContent: "center",
          zIndex: 1000, padding: "var(--spacing-md)",
        }}>
          <div className="structural-grid" style={{ width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            {/* Modal Header */}
            <div className="grid-cell">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div className="row">
                  <span className="badge" style={{ color: "var(--accent-cyan)", borderColor: "var(--accent-cyan)" }}>EDIT_RECORD</span>
                  <span className="muted">{editingQuestion.id}</span>
                </div>
                <button
                  onClick={closeEditor}
                  className="muted"
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}
                >
                  [✕ CLOSE]
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="grid-cell stack">
              {/* Question Text */}
              <div className="input-group">
                <label className="input-label">Question Text</label>
                <textarea
                  className="input-field"
                  value={editText}
                  onChange={(e) => setEditText(e.target.value)}
                  style={{
                    minHeight: "100px", padding: "var(--spacing-sm)",
                    border: "1px solid var(--border-color)", fontFamily: "var(--font-body)",
                    fontSize: "14px", lineHeight: 1.6,
                  }}
                />
              </div>

              {/* Company + Round */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-md)" }}>
                <div className="input-group">
                  <label className="input-label">Company</label>
                  <input
                    type="text"
                    className="input-field"
                    value={editCompany}
                    onChange={(e) => setEditCompany(e.target.value)}
                  />
                </div>
                <div className="input-group">
                  <label className="input-label">Round</label>
                  <select className="input-field" value={editRound} onChange={(e) => setEditRound(e.target.value as Round)}>
                    {ROUNDS.map(r => <option key={r} value={r}>{ROUND_LABELS[r]}</option>)}
                  </select>
                </div>
              </div>

              {/* Category + Difficulty */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--spacing-md)" }}>
                <div className="input-group">
                  <label className="input-label">Category</label>
                  <select className="input-field" value={editCategory} onChange={(e) => setEditCategory(e.target.value as Category)}>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div className="input-group">
                  <label className="input-label">Difficulty</label>
                  <select className="input-field" value={editDifficulty} onChange={(e) => setEditDifficulty(e.target.value as Difficulty)}>
                    {DIFFICULTY.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
                  </select>
                </div>
              </div>

              {/* Tags — Editable comma-separated */}
              <div className="input-group">
                <label className="input-label">Tags (comma-separated)</label>
                <input
                  type="text"
                  className="input-field"
                  value={editTags}
                  onChange={(e) => setEditTags(e.target.value)}
                  style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }}
                />
                <div className="row" style={{ marginTop: "var(--spacing-sm)", flexWrap: "wrap" }}>
                  {editTags.split(",").map(t => t.trim()).filter(Boolean).map(tag => (
                    <span key={tag} className="badge" style={{ fontSize: "10px" }}>#{tag}</span>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="row" style={{ justifyContent: "flex-end", marginTop: "var(--spacing-md)" }}>
                {saveStatus === "SAVED" && (
                  <span className="badge" style={{ color: "var(--accent-cyan)", borderColor: "var(--accent-cyan)", marginRight: "var(--spacing-sm)" }}>
                    ✓ RECORD_UPDATED
                  </span>
                )}
                <button className="btn" onClick={closeEditor} style={{ marginRight: "var(--spacing-sm)" }}>
                  [CANCEL]
                </button>
                <button className="btn btn-primary" onClick={handleSave}>
                  [SAVE CHANGES]
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
