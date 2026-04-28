import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { getTags, deleteTag } from "@/lib/api";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { Tag } from "@/lib/types";

export function AdminTagsPage() {
  useAuth();
  const [tags, setTags] = useState<Tag[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const fetchTags = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getTags();
      setTags(data);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTags();
  }, [fetchTags]);

  const handleDelete = (id: string, count: number) => {
    if (count > 0) return; // Prevent deletion if used
    setConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!confirmId) return;
    try {
      await deleteTag(confirmId);
      fetchTags();
    } catch {
      alert("Failed to delete tag.");
    } finally {
      setConfirmId(null);
    }
  };

  const filteredTags = tags.filter(t => t.name.toLowerCase().includes(search.toLowerCase()));
  const targetDelete = tags.find(t => t.id === confirmId);

  return (
    <div className="container" style={{ minHeight: "100vh" }}>
      <header className="row" style={{ paddingBottom: "var(--spacing-md)", borderBottom: "1px solid var(--border-color)", marginBottom: "var(--spacing-lg)" }}>
        <div className="row">
          <Link to="/admin" className="muted" style={{ textDecoration: "none", marginRight: "16px" }}>[← BACK]</Link>
          <span className="badge">TAGS</span>
        </div>
      </header>

      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <h1 style={{ fontSize: "2.5rem" }}>Tags</h1>
        <p className="muted">Clean up unused AI-generated tags</p>
      </div>

      <div className="structural-grid" style={{ marginBottom: "var(--spacing-md)" }}>
        <div className="grid-cell" style={{ padding: "var(--spacing-md)" }}>
          <div className="input-group">
            <label className="input-label">SEARCH TAGS</label>
            <input type="text" className="input-field" placeholder="Filter by name..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="structural-grid"><div className="grid-cell" style={{ textAlign: "center", padding: "var(--spacing-xl)" }}><p className="muted">LOADING...</p></div></div>
      ) : (
        <div className="structural-grid">
          <div className="grid-cell">
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-mono)", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                  <th style={{ padding: "12px" }}>ID</th>
                  <th style={{ padding: "12px" }}>NAME</th>
                  <th style={{ padding: "12px" }}>QUESTIONS</th>
                  <th style={{ padding: "12px", textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filteredTags.map(tag => (
                  <tr key={tag.id} style={{ borderBottom: "1px solid #222" }}>
                    <td style={{ padding: "12px", color: "var(--muted)" }}>{tag.id.substring(0, 8)}</td>
                    <td style={{ padding: "12px" }}>#{tag.name}</td>
                    <td style={{ padding: "12px" }}>{tag.questionCount || 0}</td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      <button onClick={() => handleDelete(tag.id, tag.questionCount || 0)} className="btn" 
                        style={{ padding: "4px 8px", fontSize: "11px", borderColor: (tag.questionCount || 0) > 0 ? "var(--border-color)" : "#f87171", color: (tag.questionCount || 0) > 0 ? "var(--muted)" : "#f87171" }} 
                        disabled={(tag.questionCount || 0) > 0}>
                        [DELETE]
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredTags.length === 0 && <p className="muted" style={{ padding: "var(--spacing-md)", textAlign: "center" }}>No tags found.</p>}
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {confirmId && targetDelete && (
        <ConfirmDialog
          message={`Are you sure you want to delete the tag "#${targetDelete.name}"?`}
          subMessage="This action cannot be undone."
          onConfirm={confirmDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
