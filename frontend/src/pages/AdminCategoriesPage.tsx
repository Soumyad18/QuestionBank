import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { getCategories, createCategory, updateCategory, deleteCategory } from "@/lib/api";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { CategoryItem } from "@/lib/types";

export function AdminCategoriesPage() {
  useAuth();
  const [categories, setCategories] = useState<CategoryItem[]>([]);
  const [loading, setLoading] = useState(false);

  // Edit/Create state
  const [editing, setEditing] = useState<CategoryItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [editName, setEditName] = useState("");
  const [editInterviewType, setEditInterviewType] = useState("backend");
  const [saveStatus, setSaveStatus] = useState<"" | "SAVING" | "SAVED" | "ERROR">("");
  
  // Delete state
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const fetchCategories = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCategories();
      setCategories(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const openCreator = () => {
    setIsNew(true);
    setEditing({ id: "new", name: "", interviewType: "backend", questionCount: 0, createdAt: "" });
    setEditName("");
    setEditInterviewType("backend");
    setSaveStatus("");
  };

  const openEditor = (cat: CategoryItem) => {
    if (cat.name === "General") return;
    setIsNew(false);
    setEditing(cat);
    setEditName(cat.name);
    setEditInterviewType(cat.interviewType ?? "backend");
    setSaveStatus("");
  };

  const handleSave = async () => {
    if (!editing || !editName.trim()) return;
    setSaveStatus("SAVING");
    try {
      if (isNew) {
        await createCategory(editName.trim(), editInterviewType);
      } else {
        await updateCategory(editing.id, editName.trim());
      }
      setSaveStatus("SAVED");
      fetchCategories();
      setTimeout(() => setEditing(null), 1000);
    } catch {
      setSaveStatus("ERROR");
    }
  };

  const handleDelete = (id: string, name: string) => {
    if (name === "General") return; // Protect
    setConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!confirmId) return;
    try {
      await deleteCategory(confirmId);
      fetchCategories();
    } catch {
      alert("Failed to delete category.");
    } finally {
      setConfirmId(null);
    }
  };

  const targetDelete = categories.find(c => c.id === confirmId);

  return (
    <div className="container" style={{ minHeight: "100vh" }}>
      <header className="row" style={{ justifyContent: "space-between", paddingBottom: "var(--spacing-md)", borderBottom: "1px solid var(--border-color)", marginBottom: "var(--spacing-lg)" }}>
        <div className="row">
          <Link to="/admin" className="muted" style={{ textDecoration: "none", marginRight: "16px" }}>[← BACK]</Link>
          <span className="badge">CATEGORIES</span>
        </div>
      </header>

      <div style={{ marginBottom: "var(--spacing-lg)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem" }}>Categories</h1>
          <p className="muted">Manage AI classification constraints</p>
        </div>
        <button className="btn btn-primary" onClick={openCreator}>[+ NEW CATEGORY]</button>
      </div>

      {loading ? (
        <div className="structural-grid"><div className="grid-cell" style={{ textAlign: "center", padding: "var(--spacing-xl)" }}><p className="muted">LOADING...</p></div></div>
      ) : (
        <div className="structural-grid">
          <div className="grid-cell">
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-mono)", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                  <th style={{ padding: "12px" }}>NAME</th>
                  <th style={{ padding: "12px" }}>TYPE</th>
                  <th style={{ padding: "12px" }}>QUESTIONS</th>
                  <th style={{ padding: "12px", textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {categories.map(cat => (
                  <tr key={cat.id} style={{ borderBottom: "1px solid #222" }}>
                    <td style={{ padding: "12px" }}>{cat.name} {cat.name === "General" && <span className="badge" style={{ marginLeft: "8px", fontSize: "10px" }}>PROTECTED</span>}</td>
                    <td style={{ padding: "12px" }}>
                      <span className="badge" style={{
                        fontSize: "10px",
                        color: cat.interviewType === "backend" ? "#60a5fa" : cat.interviewType === "frontend" ? "#f472b6" : "#4ade80",
                        borderColor: cat.interviewType === "backend" ? "#60a5fa" : cat.interviewType === "frontend" ? "#f472b6" : "#4ade80"
                      }}>
                        {cat.interviewType?.toUpperCase()}
                      </span>
                    </td>
                    <td style={{ padding: "12px" }}>{cat.questionCount}</td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      <button onClick={() => openEditor(cat)} className="btn" style={{ padding: "4px 8px", fontSize: "11px", marginRight: "8px" }} disabled={cat.name === "General"}>[EDIT]</button>
                      <button onClick={() => handleDelete(cat.id, cat.name)} className="btn" style={{ padding: "4px 8px", fontSize: "11px", borderColor: cat.name === "General" ? "var(--border-color)" : "#f87171", color: cat.name === "General" ? "var(--muted)" : "#f87171" }} disabled={cat.name === "General"}>[DELETE]</button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {confirmId && targetDelete && (
        <ConfirmDialog
          message={`Are you sure you want to delete the category "${targetDelete.name}"?`}
          subMessage={`${targetDelete.questionCount} questions are assigned to this category. They will be moved to General.`}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}

      {/* Edit/Create Modal */}
      {editing && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "var(--spacing-md)" }}>
          <div className="structural-grid" style={{ width: "100%", maxWidth: "500px" }}>
            <div className="grid-cell">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <span className="badge" style={{ color: "var(--accent-cyan)", borderColor: "var(--accent-cyan)" }}>
                  {isNew ? "NEW_CATEGORY" : "EDIT_CATEGORY"}
                </span>
                <button onClick={() => setEditing(null)} className="muted" style={{ background: "none", border: "none", cursor: "pointer", fontSize: "14px" }}>[✕ CLOSE]</button>
              </div>
            </div>

            <div className="grid-cell stack">
              <div className="input-group">
                <label className="input-label">Category Name</label>
                <input type="text" className="input-field" value={editName} onChange={(e) => setEditName(e.target.value)}
                  style={{ fontFamily: "var(--font-mono)", fontSize: "16px" }} autoFocus />
              </div>

              {isNew && (
                <div className="input-group">
                  <label className="input-label">Interview Type</label>
                  <select className="input-field" value={editInterviewType} onChange={(e) => setEditInterviewType(e.target.value)}>
                    <option value="backend">Backend</option>
                    <option value="frontend">Frontend</option>
                    <option value="shared">Shared (visible in all types)</option>
                  </select>
                </div>
              )}

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
