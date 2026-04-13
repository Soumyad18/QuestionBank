import { useState, useMemo } from "react";
import { Link } from "react-router-dom";
import { QuestionCard } from "@/components/question-card";
import { CATEGORIES, ROUNDS, ROUND_LABELS, DIFFICULTY } from "@/lib/categories";
import { MOCK_QUESTIONS, MOCK_COMPANIES, MOCK_TAGS } from "@/lib/mock-data";
import type { Question } from "@/lib/types";

export function QuestionsPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCompany, setSelectedCompany] = useState("");
  const [selectedRound, setSelectedRound] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [selectedDifficulty, setSelectedDifficulty] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);

  const filteredQuestions = useMemo(() => {
    return MOCK_QUESTIONS.filter((q: Question) => {
      // Text search
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

  return (
    <div className="container">
      {/* Header */}
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--spacing-lg)" }}>
        <div>
          <div className="row" style={{ marginBottom: "var(--spacing-sm)" }}>
            <Link to="/" className="badge">[HOME]</Link>
            <span className="badge">DISCOVERY</span>
          </div>
          <h1 style={{ fontSize: "2.5rem" }}>Question Index</h1>
          <p className="muted">{filteredQuestions.length} records found across {MOCK_COMPANIES.length} companies</p>
        </div>
      </header>

      {/* Search Bar */}
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

      {/* Filter Panel */}
      <div className="structural-grid" style={{ marginBottom: "var(--spacing-lg)" }}>
        <div className="grid-cell">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: filtersOpen ? "var(--spacing-md)" : "0" }}>
            <button
              className="muted"
              onClick={() => setFiltersOpen(!filtersOpen)}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "12px" }}
            >
              {filtersOpen ? "▼" : "▶"} FILTER_CONTROLS
            </button>
            {hasActiveFilters && (
              <button
                className="muted"
                onClick={clearFilters}
                style={{
                  background: "none", border: "1px solid var(--border-color)", cursor: "pointer",
                  padding: "4px 8px", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--accent-cyan)"
                }}
              >
                [CLEAR ALL]
              </button>
            )}
          </div>

          {filtersOpen && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "var(--spacing-md)" }}>
              {/* Company */}
              <div className="input-group">
                <label className="input-label">Company</label>
                <select
                  className="input-field"
                  value={selectedCompany}
                  onChange={(e) => setSelectedCompany(e.target.value)}
                  style={{ cursor: "pointer" }}
                >
                  <option value="">ALL</option>
                  {MOCK_COMPANIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Round */}
              <div className="input-group">
                <label className="input-label">Round</label>
                <select
                  className="input-field"
                  value={selectedRound}
                  onChange={(e) => setSelectedRound(e.target.value)}
                  style={{ cursor: "pointer" }}
                >
                  <option value="">ALL</option>
                  {ROUNDS.map(r => <option key={r} value={r}>{ROUND_LABELS[r]}</option>)}
                </select>
              </div>

              {/* Category (Journal) */}
              <div className="input-group">
                <label className="input-label">Category</label>
                <select
                  className="input-field"
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  style={{ cursor: "pointer" }}
                >
                  <option value="">ALL</option>
                  {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>

              {/* Difficulty */}
              <div className="input-group">
                <label className="input-label">Difficulty</label>
                <select
                  className="input-field"
                  value={selectedDifficulty}
                  onChange={(e) => setSelectedDifficulty(e.target.value)}
                  style={{ cursor: "pointer" }}
                >
                  <option value="">ALL</option>
                  {DIFFICULTY.map(d => <option key={d} value={d}>{d.toUpperCase()}</option>)}
                </select>
              </div>

              {/* Tag */}
              <div className="input-group">
                <label className="input-label">Tag</label>
                <select
                  className="input-field"
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  style={{ cursor: "pointer" }}
                >
                  <option value="">ALL</option>
                  {MOCK_TAGS.map(t => <option key={t} value={t}>#{t}</option>)}
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {filteredQuestions.length === 0 ? (
        <div className="structural-grid">
          <div className="grid-cell" style={{ textAlign: "center", padding: "var(--spacing-xl)" }}>
            <p className="muted" style={{ fontSize: "16px" }}>NO_RESULTS: Query returned 0 records.</p>
            <button className="btn" onClick={clearFilters} style={{ marginTop: "var(--spacing-md)" }}>
              [RESET FILTERS]
            </button>
          </div>
        </div>
      ) : (
        <div className="stack">
          {filteredQuestions.map((question) => (
            <QuestionCard key={question.id} question={question} />
          ))}
        </div>
      )}
    </div>
  );
}
