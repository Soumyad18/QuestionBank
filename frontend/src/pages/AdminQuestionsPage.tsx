import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";
import { digestParse, digestCommit, getCategories } from "../lib/api";
import type { DigestParseResponse, ParsedSession } from "../lib/api";
import type { CategoryItem } from "../lib/types";

type Step = "INPUT" | "PREVIEW" | "SUCCESS";

export function AdminQuestionsPage() {
  useAuth();

  const [rawText,   setRawText]   = useState("");
  const [step,      setStep]      = useState<Step>("INPUT");
  const [parsed,    setParsed]    = useState<DigestParseResponse | null>(null);
  const [sessions,  setSessions]  = useState<ParsedSession[]>([]);
  const [loading,   setLoading]   = useState(false);
  const [error,     setError]     = useState("");
  const [commitResult, setCommitResult] = useState<{ savedQuestions: number; linkedQuestions: number; newSessions: number } | null>(null);
  const [categoriesList, setCategoriesList] = useState<CategoryItem[]>([]);

  useEffect(() => {
    getCategories().then(setCategoriesList).catch(() => {});
  }, []);

  const handleParse = async () => {
    if (!rawText.trim()) return;
    setLoading(true);
    setError("");
    try {
      const result = await digestParse(rawText);
      setParsed(result);
      setSessions(result.sessions);
      setStep("PREVIEW");
    } catch (e: any) {
      setError(e.message ?? "Parse failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleCommit = async () => {
    if (!sessions.length) return;
    setLoading(true);
    setError("");
    try {
      const result = await digestCommit({ sessions });
      setCommitResult(result);
      setStep("SUCCESS");
    } catch (e: any) {
      setError(e.message ?? "Commit failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleReset = () => {
    setRawText(""); setStep("INPUT"); setParsed(null);
    setSessions([]); setError(""); setCommitResult(null);
  };

  const updateQuestion = (sIdx: number, qIdx: number, field: string, value: string) => {
    setSessions(prev => prev.map((s, si) => si !== sIdx ? s : {
      ...s,
      questions: s.questions.map((q, qi) => qi !== qIdx ? q : { ...q, [field]: value }),
    }));
  };

  const removeQuestion = (sIdx: number, qIdx: number) => {
    setSessions(prev => prev.map((s, si) => si !== sIdx ? s : {
      ...s,
      questions: s.questions.filter((_, qi) => qi !== qIdx),
    }));
  };

  return (
    <div className="container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      <header className="row" style={{ paddingBottom: "var(--spacing-md)", borderBottom: "1px solid var(--border-color)", marginBottom: "var(--spacing-lg)" }}>
        <div className="row">
          <Link to="/admin" className="muted" style={{ textDecoration: "none", marginRight: "16px" }}>[← BACK]</Link>
          <span className="badge">INGESTION</span>
        </div>
      </header>

      <section className="stack" style={{ flexGrow: 1, paddingTop: "var(--spacing-lg)", display: "flex", flexDirection: "column" }}>

        {/* ── STEP 1: INPUT ── */}
        {step === "INPUT" && (
          <>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
              <div>
                <h1 style={{ fontSize: "2.5rem" }}>Data Ingestion Module</h1>
                <p className="muted">Paste raw interview text. AI will parse, tag, and preview before saving.</p>
              </div>
            </div>

            <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", padding: "var(--spacing-md) 0" }}>
              <textarea
                className="input-field"
                placeholder="[ PASTE RAW TEXT HERE... ]"
                value={rawText}
                onChange={(e) => setRawText(e.target.value)}
                disabled={loading}
                style={{ flexGrow: 1, width: "100%", minHeight: "400px", resize: "none", fontFamily: "var(--font-mono)", fontSize: "14px", lineHeight: 1.8, border: "1px solid var(--border-color)", padding: "var(--spacing-md)", backgroundColor: "rgba(255,255,255,0.02)" }}
              />
            </div>

            {error && <p className="muted" style={{ color: "red" }}>{error}</p>}

            <div className="row" style={{ justifyContent: "flex-end", paddingTop: "var(--spacing-md)" }}>
              <button className="btn btn-primary" onClick={handleParse} disabled={loading || !rawText.trim()}
                style={{ fontSize: "16px", padding: "16px 48px", opacity: loading ? 0.5 : 1 }}>
                {loading ? "[ PARSING... ]" : "[ PARSE // PREVIEW ]"}
              </button>
            </div>
          </>
        )}

        {/* ── STEP 2: PREVIEW ── */}
        {step === "PREVIEW" && parsed && (
          <>
            <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--spacing-lg)" }}>
              <div>
                <h1 style={{ fontSize: "2.5rem" }}>Review Parsed Data</h1>
                <p className="muted">{sessions.length} session(s) · {sessions.reduce((a, s) => a + s.questions.length, 0)} question(s) — edit before committing</p>
              </div>
              <button className="btn" onClick={handleReset} style={{ fontSize: "11px" }}>[← BACK]</button>
            </div>

            {sessions.map((session, sIdx) => (
              <div key={sIdx} className="structural-grid" style={{ marginBottom: "var(--spacing-lg)" }}>
                <div className="grid-cell">
                  <div className="row" style={{ marginBottom: "var(--spacing-md)" }}>
                    <span className="badge" style={{ color: "var(--accent-cyan)", borderColor: "var(--accent-cyan)" }}>
                      {session.companyName} · {session.round.toUpperCase()} · {session.date}
                    </span>
                    {session.interviewerName && <span className="muted">by {session.interviewerName}</span>}
                  </div>

                  <div className="stack">
                    {session.questions.map((q, qIdx) => (
                      <div key={qIdx} style={{ border: "1px solid var(--border-color)", padding: "var(--spacing-md)", display: "grid", gap: "var(--spacing-sm)" }}>
                        <div className="row" style={{ justifyContent: "space-between" }}>
                          <span className="muted" style={{ fontSize: "11px" }}>Q{qIdx + 1}</span>
                          <button onClick={() => removeQuestion(sIdx, qIdx)} className="muted"
                            style={{ background: "none", border: "none", cursor: "pointer", color: "#f87171", fontSize: "11px" }}>
                            [REMOVE]
                          </button>
                        </div>
                        <textarea
                          className="input-field"
                          value={q.text}
                          onChange={(e) => updateQuestion(sIdx, qIdx, "text", e.target.value)}
                          style={{ minHeight: "60px", fontFamily: "var(--font-body)", fontSize: "14px", padding: "var(--spacing-sm)", border: "1px solid var(--border-color)" }}
                        />
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "var(--spacing-sm)" }}>
                          <select className="input-field" value={q.category}
                            onChange={(e) => updateQuestion(sIdx, qIdx, "category", e.target.value)}
                            style={{ fontSize: "12px" }}>
                            <option value="">Select Category...</option>
                            {categoriesList.map(c => <option key={c.id} value={c.name}>{c.name}</option>)}
                          </select>
                          <input className="input-field" value={q.tags.join(", ")}
                            onChange={(e) => updateQuestion(sIdx, qIdx, "tags", e.target.value.split(",").map(t => t.trim()).filter(Boolean) as any)}
                            placeholder="tags, comma, separated" style={{ fontSize: "12px", fontFamily: "var(--font-mono)" }} />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}

            {error && <p className="muted" style={{ color: "red" }}>{error}</p>}

            <div className="row" style={{ justifyContent: "flex-end", paddingTop: "var(--spacing-md)" }}>
              <button className="btn btn-primary" onClick={handleCommit} disabled={loading}
                style={{ fontSize: "16px", padding: "16px 48px", opacity: loading ? 0.5 : 1 }}>
                {loading ? "[ COMMITTING... ]" : "[ COMMIT TO DB ]"}
              </button>
            </div>
          </>
        )}

        {/* ── STEP 3: SUCCESS ── */}
        {step === "SUCCESS" && commitResult && (
          <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", flexGrow: 1, gap: "var(--spacing-lg)" }}>
            <span className="badge" style={{ color: "var(--accent-cyan)", borderColor: "var(--accent-cyan)", fontSize: "16px", padding: "12px 24px" }}>
              ✓ BATCH_COMMITTED
            </span>
            <div className="structural-grid" style={{ width: "100%", maxWidth: "400px" }}>
              <div className="grid-cell stack">
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="muted">New questions saved</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent-cyan)" }}>{commitResult.savedQuestions}</span>
                </div>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="muted">Existing questions linked</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent-cyan)" }}>{commitResult.linkedQuestions}</span>
                </div>
                <div className="row" style={{ justifyContent: "space-between" }}>
                  <span className="muted">Sessions created</span>
                  <span style={{ fontFamily: "var(--font-mono)", color: "var(--accent-cyan)" }}>{commitResult.newSessions}</span>
                </div>
              </div>
            </div>
            <div className="row">
              <button className="btn btn-primary" onClick={handleReset}>[INGEST MORE]</button>
              <Link to="/admin/manage" className="btn" style={{ marginLeft: "var(--spacing-sm)" }}>[VIEW QUESTIONS]</Link>
            </div>
          </div>
        )}

      </section>
    </div>
  );
}
