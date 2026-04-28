import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { getCompanies, createCompany, updateCompany, deleteCompany } from "@/lib/api";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Company } from "@/lib/types";

export function AdminCompaniesPage() {
  useAuth();
  const [companies, setCompanies] = useState<Company[]>([]);
  const [loading, setLoading] = useState(false);

  // Edit/Create state
  const [editing, setEditing] = useState<Company | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [editName, setEditName] = useState("");
  const [saveStatus, setSaveStatus] = useState<"" | "SAVING" | "SAVED" | "ERROR">("");
  
  // Delete state
  const [confirmSlug, setConfirmSlug] = useState<string | null>(null);

  const fetchCompanies = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCompanies();
      setCompanies(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCompanies();
  }, [fetchCompanies]);

  const openCreator = () => {
    setIsNew(true);
    setEditing({ id: "new", slug: "", name: "", questionCount: 0, sessionCount: 0, createdAt: "" });
    setEditName("");
    setSaveStatus("");
  };

  const openEditor = (company: Company) => {
    setIsNew(false);
    setEditing(company);
    setEditName(company.name);
    setSaveStatus("");
  };

  const handleSave = async () => {
    if (!editing || !editName.trim()) return;
    setSaveStatus("SAVING");
    try {
      if (isNew) {
        await createCompany(editName.trim());
      } else {
        await updateCompany(editing.slug, editName.trim());
      }
      setSaveStatus("SAVED");
      fetchCompanies();
      setTimeout(() => setEditing(null), 1000);
    } catch {
      setSaveStatus("ERROR");
    }
  };

  const handleDelete = (slug: string, sessionCount: number) => {
    if (sessionCount > 0) {
      alert(`Cannot delete this company because it has ${sessionCount} sessions associated with it.`);
      return;
    }
    setConfirmSlug(slug);
  };

  const confirmDelete = async () => {
    if (!confirmSlug) return;
    try {
      await deleteCompany(confirmSlug);
      fetchCompanies();
    } catch {
      alert("Failed to delete company.");
    } finally {
      setConfirmSlug(null);
    }
  };

  const targetDelete = companies.find(c => c.slug === confirmSlug);

  return (
    <div className="container" style={{ minHeight: "100vh" }}>
      <header className="row" style={{ justifyContent: "space-between", paddingBottom: "var(--spacing-md)", borderBottom: "1px solid var(--border-color)", marginBottom: "var(--spacing-lg)" }}>
        <div className="row">
          <Link to="/admin" className="muted" style={{ textDecoration: "none", marginRight: "16px" }}>[← BACK]</Link>
          <span className="badge">COMPANIES</span>
        </div>
      </header>

      <div style={{ marginBottom: "var(--spacing-lg)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem" }}>Companies</h1>
          <p className="muted">Manage company entities manually</p>
        </div>
        <button className="btn btn-primary" onClick={openCreator}>[+ NEW COMPANY]</button>
      </div>

      {loading ? (
        <div className="structural-grid"><div className="grid-cell" style={{ textAlign: "center", padding: "var(--spacing-xl)" }}><p className="muted">LOADING...</p></div></div>
      ) : (
        <div className="structural-grid">
          <div className="grid-cell">
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-mono)", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                  <th style={{ padding: "12px" }}>SLUG</th>
                  <th style={{ padding: "12px" }}>NAME</th>
                  <th style={{ padding: "12px" }}>SESSIONS</th>
                  <th style={{ padding: "12px" }}>QUESTIONS</th>
                  <th style={{ padding: "12px", textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {companies.map(company => (
                  <tr key={company.slug} style={{ borderBottom: "1px solid #222" }}>
                    <td style={{ padding: "12px", color: "var(--muted)" }}>{company.slug}</td>
                    <td style={{ padding: "12px" }}>{company.name}</td>
                    <td style={{ padding: "12px" }}>{company.sessionCount || 0}</td>
                    <td style={{ padding: "12px" }}>{company.questionCount || 0}</td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      <button onClick={() => openEditor(company)} className="btn" style={{ padding: "4px 8px", fontSize: "11px", marginRight: "8px" }}>[EDIT]</button>
                      <button onClick={() => handleDelete(company.slug, company.sessionCount || 0)} className="btn" 
                        style={{ padding: "4px 8px", fontSize: "11px", borderColor: (company.sessionCount || 0) > 0 ? "var(--border-color)" : "#f87171", color: (company.sessionCount || 0) > 0 ? "var(--muted)" : "#f87171" }} 
                        disabled={(company.sessionCount || 0) > 0}>
                        [DELETE]
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {confirmSlug && targetDelete && (
        <ConfirmDialog
          message={`Are you sure you want to delete the company "${targetDelete.name}"?`}
          subMessage="This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setConfirmSlug(null)}
        />
      )}

      {/* Edit/Create Modal */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "var(--spacing-md)" }}>
          <div className="structural-grid" style={{ width: "100%", maxWidth: "500px" }}>
            <div className="grid-cell">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="badge" style={{ color: "var(--accent-cyan)", borderColor: "var(--accent-cyan)" }}>
                  {isNew ? "NEW_COMPANY" : "EDIT_COMPANY"}
                </span>
                <button onClick={() => setEditing(null)} className="muted" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}>[✕ CLOSE]</button>
              </div>
            </div>

            <div className="grid-cell stack">
              <div className="input-group">
                <label className="input-label">Company Name</label>
                <input type="text" className="input-field" value={editName} onChange={(e) => setEditName(e.target.value)}
                  style={{ fontFamily: "var(--font-mono)", fontSize: "16px" }} autoFocus />
              </div>

              <div className="row" style={{ justifyContent: "flex-end", marginTop: "var(--spacing-md)" }}>
                {saveStatus === "SAVED"  && <span className="badge" style={{ color: "var(--accent-cyan)", borderColor: "var(--accent-cyan)", marginRight: "var(--spacing-sm)" }}>✓ SAVED</span>}
                {saveStatus === "ERROR"  && <span className="badge" style={{ color: "#f87171", borderColor: "#f87171", marginRight: "var(--spacing-sm)" }}>✗ ERROR</span>}
                <button className="btn" onClick={() => setEditing(null)} style={{ marginRight: "var(--spacing-sm)" }}>[CANCEL]</button>
                <button className="btn btn-primary" onClick={handleSave} disabled={saveStatus === "SAVING" || !editName.trim()}>
                  {saveStatus === "SAVING" ? "[ SAVING... ]" : "[ SAVE ]"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
