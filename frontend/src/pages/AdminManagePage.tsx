import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { QuestionCard } from "@/components/question-card";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ROUNDS, ROUND_LABELS } from "@/lib/categories";
import { searchQuestions, getCompanies, getCategories, updateQuestion, deleteQuestion } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import type { Question, Company, PageResponse, CategoryItem } from "@/lib/types";

export function AdminManagePage() {
  useAuth();
  const [search,       setSearch]       = useState("");
  const [interviewType,setInterviewType]= useState("");
  const [company,      setCompany]      = useState("");
  const [round,        setRound]        = useState("");
  const [category,     setCategory]     = useState("");
  const [importance,   setImportance]   = useState("");

  const [page,          setPage]          = useState(0);
  const [result,        setResult]        = useState<PageResponse<Question> | null>(null);
  const [companies,     setCompanies]     = useState<Company[]>([]);
  const [categoriesList,setCategoriesList]= useState<CategoryItem[]>([]);
  const [loading,       setLoading]       = useState(false);

  // Edit modal
  const [editing,      setEditing]      = useState<Question | null>(null);
  const [editText,     setEditText]     = useState("");
  const [editCategory, setEditCategory] = useState<string>("General");
  const [editTags,     setEditTags]     = useState("");
  const [saveStatus,   setSaveStatus]   = useState<"" | "SAVING" | "SAVED" | "ERROR">("");
  const [confirmId,    setConfirmId]    = useState<string | null>(null);

  useEffect(() => {
    getCompanies().then(setCompanies).catch(() => {});
    getCategories().then(setCategoriesList).catch(() => {});
  }, []);

  const fetchQuestions = useCallback(async (p = 0) => {
    setLoading(true);
    try {
      const data = await searchQuestions({ search, interviewType, category, company, round, importance, page: p, size: 20 });
      setResult(data);
      setPage(p);
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

  const filteredCategories = interviewType === "fullstack"
    ? categoriesList
    : interviewType
      ? categoriesList.filter(c => c.interviewType === interviewType || c.interviewType === "shared")
      : categoriesList;

  const hasActiveFilters = search || interviewType || company || round || category || importance;

  const openEditor = (q: Question) => {
    setEditing(q);
    setEditText(q.text);
    setEditCategory(q.category);
    setEditTags(q.tags.join(", "));
    setSaveStatus("");
  };

  const handleSave = async () => {
    if (!editing) return;
    setSaveStatus("SAVING");
    try {
      await updateQuestion(editing.id, {
        text: editText,
        category: editCategory,
        tags: editTags.split(",").map(t => t.trim()).filter(Boolean),
      });
      setSaveStatus("SAVED");
      setTimeout(() => {
        setEditing(null);
        fetchQuestions(page);
      }, 1000);
    } catch {
      setSaveStatus("ERROR");
    }
  };

  const handleDelete = async (id: string) => setConfirmId(id);

  const confirmDelete = async () => {
    if (!confirmId) return;
    try {
      await deleteQuestion(confirmId);
      fetchQuestions(page);
    } catch {
      alert("Failed to delete question.");
    } finally {
      setConfirmId(null);
    }
  };

  return (
    <div className="container" style={{ minHeight: "100vh" }}>
      <header className="row" style={{ paddingBottom: "var(--spacing-md)", borderBottom: "1px solid var(--border-color)", marginBottom: "var(--spacing-lg)" }}>
        <div className="row">
          <Link to="/admin" className="muted" style={{ textDecoration: "none", marginRight: "16px" }}>[← BACK]</Link>
          <span className="badge">QUESTION_BANK</span>
        </div>
      </header>

      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <h1 style={{ fontSize: "2.5rem" }}>Question Management</h1>
        <p className="muted">{result ? `${result.page.totalElements} total records` : "Loading..."}</p>
      </div>

      {/* Search */}
      <div className="structural-grid" style={{ marginBottom: "var(--spacing-md)" }}>
        <div className="grid-cell" style={{ padding: "var(--spacing-md)" }}>
          <div className="input-group">
            <label className="input-label">SEARCH QUERY</label>
            <input type="text" className="input-field" placeholder="Search by keyword, company, or tag..."
              value={search} onChange={(e) => setSearch(e.target.value)} style={{ fontSize: "16px" }} />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="structural-grid" style={{ marginBottom: "var(--spacing-lg)" }}>
        <div className="grid-cell">
          <div className="row" style={{ justifyContent: "space-between", marginBottom: "var(--spacing-md)" }}>
            <span className="muted" style={{ fontFamily: "var(--font-mono)", fontSize: "12px" }}>▼ FILTER_CONTROLS</span>
            {hasActiveFilters && (
              <button className="muted" onClick={clearFilters}
                style={{ background: "none", border: "1px solid var(--border-color)", cursor: "pointer", padding: "4px 8px", fontFamily: "var(--font-mono)", fontSize: "11px", color: "var(--accent-cyan)" }}>
                [CLEAR ALL]
              </button>
            )}
          </div>
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
        </div>
      </div>

      {/* Question List */}
      {loading ? (
        <div className="structural-grid">
          <div className="grid-cell" style={{ textAlign: "center", padding: "var(--spacing-xl)" }}>
            <p className="muted">LOADING...</p>
          </div>
        </div>
      ) : result?.content.length === 0 ? (
        <div className="structural-grid">
          <div className="grid-cell" style={{ textAlign: "center", padding: "var(--spacing-xl)" }}>
            <p className="muted">NO_RESULTS: Query returned 0 records.</p>
            <button className="btn" onClick={clearFilters} style={{ marginTop: "var(--spacing-md)" }}>[RESET FILTERS]</button>
          </div>
        </div>
      ) : (
        <>
          <div className="stack">
            {result?.content.map((q) => (
              <QuestionCard key={q.id} question={q} showEditButton onEdit={openEditor} onDelete={(q) => handleDelete(q.id)} />
            ))}
          </div>

          {result && result.page.totalPages > 1 && (
            <div className="row" style={{ justifyContent: "center", marginTop: "var(--spacing-lg)", gap: "var(--spacing-sm)" }}>
              <button className="btn" disabled={result.page.number === 0} onClick={() => fetchQuestions(page - 1)}>[PREV]</button>
              <span className="muted" style={{ padding: "0 var(--spacing-md)" }}>{page + 1} / {result.page.totalPages}</span>
              <button className="btn" disabled={result.page.number + 1 >= result.page.totalPages} onClick={() => fetchQuestions(page + 1)}>[NEXT]</button>
            </div>
          )}
        </>
      )}

      {/* Confirm Delete Dialog */}
      {confirmId && (
        <ConfirmDialog
          message="Are you sure you want to delete this question?"
          subMessage="This action is irreversible. The question will be permanently removed."
          onConfirm={confirmDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {/* Edit Modal */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "var(--spacing-md)" }}>
          <div className="structural-grid" style={{ width: "100%", maxWidth: "600px", maxHeight: "90vh", overflowY: "auto" }}>
            <div className="grid-cell">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div className="row">
                  <span className="badge" style={{ color: "var(--accent-cyan)", borderColor: "var(--accent-cyan)" }}>EDIT_RECORD</span>
                  <span className="muted" style={{ fontSize: "11px" }}>{editing.id}</span>
                </div>
                <button onClick={() => setEditing(null)} className="muted"
                  style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}>[✕ CLOSE]</button>
              </div>
            </div>

            <div className="grid-cell stack">
              <div className="input-group">
                <label className="input-label">Question Text</label>
                <textarea className="input-field" value={editText} onChange={(e) => setEditText(e.target.value)}
                  style={{ minHeight: "100px", padding: "var(--spacing-sm)", border: "1px solid var(--border-color)", fontFamily: "var(--font-body)", fontSize: "14px", lineHeight: 1.6 }} />
              </div>

              <div className="input-group">
                <label className="input-label">Category</label>
                <select className="input-field" value={editCategory} onChange={(e) => setEditCategory(e.target.value)}>
                  {categoriesList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                </select>
              </div>

              <div className="input-group">
                <label className="input-label">Tags (comma-separated)</label>
                <input type="text" className="input-field" value={editTags} onChange={(e) => setEditTags(e.target.value)}
                  style={{ fontFamily: "var(--font-mono)", fontSize: "13px" }} />
                <div className="row" style={{ marginTop: "var(--spacing-sm)", flexWrap: "wrap" }}>
                  {editTags.split(",").map(t => t.trim()).filter(Boolean).map(t => (
                    <span key={t} className="badge" style={{ fontSize: "10px" }}>#{t}</span>
                  ))}
                </div>
              </div>

              <div className="row" style={{ justifyContent: "flex-end", marginTop: "var(--spacing-md)" }}>
                {saveStatus === "SAVED" && <span className="badge" style={{ color: "var(--accent-cyan)", borderColor: "var(--accent-cyan)", marginRight: "var(--spacing-sm)" }}>✓ SAVED</span>}
                {saveStatus === "ERROR" && <span className="badge" style={{ color: "#f87171", borderColor: "#f87171", marginRight: "var(--spacing-sm)" }}>✗ ERROR</span>}
                <button className="btn" onClick={() => setEditing(null)} style={{ marginRight: "var(--spacing-sm)" }}>[CANCEL]</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saveStatus === "SAVING"}>
                  {saveStatus === "SAVING" ? "[ SAVING... ]" : "[ SAVE CHANGES ]"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
