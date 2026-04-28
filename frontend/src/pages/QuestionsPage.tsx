import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { QuestionCard } from "@/components/question-card";
import { ROUNDS, ROUND_LABELS } from "@/lib/categories";
import { searchQuestions, getCompanies, getCategories } from "@/lib/api";
import type { Question, Company, PageResponse, CategoryItem } from "@/lib/types";

export function QuestionsPage() {
  const { user, isAdmin } = useAuth();
  const [search,        setSearch]        = useState("");
  const [interviewType,  setInterviewType]  = useState("");
  const [company,        setCompany]        = useState("");
  const [round,          setRound]          = useState("");
  const [category,       setCategory]       = useState("");
  const [importance,     setImportance]     = useState("");
  const [filtersOpen, setFiltersOpen] = useState(true);

  const [page,      setPage]      = useState(0);
  const [result,    setResult]    = useState<PageResponse<Question> | null>(null);
  const [companies, setCompanies] = useState<Company[]>([]);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");

  // Load filter options once
  useEffect(() => {
    getCompanies().then(setCompanies).catch(() => {});
    getCategories().then(setCategoriesList).catch(() => {});
  }, []);

  const fetchQuestions = useCallback(async (p = 0) => {
    setLoading(true);
    setError("");
    try {
      const data = await searchQuestions({ search, interviewType, category, company, round, importance, page: p, size: 20 });
      setResult(data);
      setPage(p);
    } catch {
      setError("Failed to load questions.");
    } finally {
      setLoading(false);
    }
  }, [search, category, company, round, importance]);

  useEffect(() => {
    const t = setTimeout(() => fetchQuestions(0), search ? 400 : 0);
    return () => clearTimeout(t);
  }, [search, category, company, round, importance, fetchQuestions]);

  const clearFilters = () => {
    setSearch(""); setInterviewType(""); setCompany("");
    setRound(""); setCategory(""); setImportance("");
  };

  const hasActiveFilters = search || interviewType || company || round || category || importance;

  // Filter categories by interview type client-side
  const filteredCategories = interviewType === 'fullstack'
    ? categoriesList
    : interviewType
      ? categoriesList.filter(c => c.interviewType === interviewType || c.interviewType === 'shared')
      : categoriesList;

  return (
    <div className="container">
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "var(--spacing-lg)" }}>
        <div>
          <div className="row" style={{ marginBottom: "var(--spacing-sm)", gap: "var(--spacing-sm)" }}>
            {!user ? (
              <Link to="/" className="badge" style={{ textDecoration: "none" }}>[HOME]</Link>
            ) : (
              <Link to={isAdmin ? "/admin" : "/dashboard"} className="badge" style={{ textDecoration: "none", color: "var(--accent-cyan)", borderColor: "var(--accent-cyan)" }}>[DASHBOARD]</Link>
            )}
            <span className="badge">DISCOVERY</span>
          </div>
          <h1 style={{ fontSize: "2.5rem" }}>Question Index</h1>
          <p className="muted">
            {result ? `${result.page.totalElements} records found across ${companies.length} companies` : "Loading..."}
          </p>
        </div>
      </header>

      {/* Search */}
      <div className="structural-grid" style={{ marginBottom: "var(--spacing-md)" }}>
        <div className="grid-cell" style={{ padding: "var(--spacing-md)" }}>
          <div className="input-group">
            <label className="input-label">SEARCH QUERY</label>
            <input
              type="text"
              className="input-field"
              placeholder="Search by keyword, company, or tag..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ fontSize: "16px" }}
            />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="structural-grid" style={{ marginBottom: "var(--spacing-lg)" }}>
        <div className="grid-cell">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: filtersOpen ? "var(--spacing-md)" : "0" }}>
            <button className="muted" onClick={() => setFiltersOpen(!filtersOpen)}
              style={{ background: "none", border: "none", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "12px" }}>
              {filtersOpen ? "▼" : "▶"} FILTER_CONTROLS
            </button>
            <button className="muted" onClick={clearFilters}
              style={{ background: "none", border: "1px solid var(--border-color)", cursor: "pointer", padding: "4px 8px", fontFamily: "var(--font-mono)", fontSize: "11px", color: hasActiveFilters ? "var(--accent-cyan)" : "var(--text-secondary)", opacity: hasActiveFilters ? 1 : 0.4 }}>
              [CLEAR ALL]
            </button>
          </div>

          {filtersOpen && (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(180px, 1fr))", gap: "var(--spacing-md)" }}>
              <div className="input-group">
                <label className="input-label">Interview Type</label>
                <select className="input-field" value={interviewType} onChange={(e) => { setInterviewType(e.target.value); setCategory(""); }}>
                  <option value="">-- Select Type --</option>
                  <option value="backend">Backend</option>
                  <option value="frontend">Frontend</option>
                  <option value="fullstack">Full Stack</option>
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Company</label>
                <select className="input-field" value={company} onChange={(e) => setCompany(e.target.value)}>
                  <option value="">ALL</option>
                  {companies.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Round</label>
                <select className="input-field" value={round} onChange={(e) => setRound(e.target.value)}>
                  <option value="">ALL</option>
                  {ROUNDS.map(r => <option key={r} value={r}>{ROUND_LABELS[r]}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Category</label>
                <select className="input-field" value={category} onChange={(e) => setCategory(e.target.value)}>
                  <option value="">ALL</option>
                  {filteredCategories.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>
              <div className="input-group">
                <label className="input-label">Importance</label>
                <select className="input-field" value={importance} onChange={(e) => setImportance(e.target.value)}>
                  <option value="">ALL</option>
                  <option value="CRITICAL">CRITICAL</option>
                  <option value="HIGH">HIGH</option>
                  <option value="MODERATE">MODERATE</option>
                  <option value="LOW">LOW</option>
                </select>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Results */}
      {error && (
        <div className="structural-grid">
          <div className="grid-cell" style={{ textAlign: "center", padding: "var(--spacing-xl)" }}>
            <p className="muted" style={{ color: "red" }}>{error}</p>
          </div>
        </div>
      )}

      {loading && (
        <div className="structural-grid">
          <div className="grid-cell" style={{ textAlign: "center", padding: "var(--spacing-xl)" }}>
            <p className="muted">LOADING...</p>
          </div>
        </div>
      )}

      {!loading && !error && result && (
        <>
          {result.content.length === 0 ? (
            <div className="structural-grid">
              <div className="grid-cell" style={{ textAlign: "center", padding: "var(--spacing-xl)" }}>
                <p className="muted" style={{ fontSize: "16px" }}>NO_RESULTS: Query returned 0 records.</p>
                <button className="btn" onClick={clearFilters} style={{ marginTop: "var(--spacing-md)" }}>[RESET FILTERS]</button>
              </div>
            </div>
          ) : (
            <div className="stack">
              {result.content.map((q) => <QuestionCard key={q.id} question={q} />)}
            </div>
          )}

          {/* Pagination */}
          {result.page.totalPages > 1 && (
            <div className="row" style={{ justifyContent: "center", marginTop: "var(--spacing-lg)", gap: "var(--spacing-sm)" }}>
              <button className="btn" disabled={result.page.number === 0} onClick={() => fetchQuestions(page - 1)}>
                [PREV]
              </button>
              <span className="muted" style={{ padding: "0 var(--spacing-md)" }}>
                {page + 1} / {result.page.totalPages}
              </span>
              <button className="btn" disabled={result.page.number + 1 >= result.page.totalPages} onClick={() => fetchQuestions(page + 1)}>
                [NEXT]
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
