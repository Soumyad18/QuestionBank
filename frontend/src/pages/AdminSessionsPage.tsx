import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { getSessions, deleteSession } from "@/lib/api";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { ROUND_LABELS } from "@/lib/categories";
import type { Session } from "@/lib/types";

export function AdminSessionsPage() {
  useAuth();
  const [sessions, setSessions] = useState<Session[]>([]);
  const [loading, setLoading] = useState(false);
  const [confirmId, setConfirmId] = useState<string | null>(null);

  const fetchSessions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getSessions();
      // Sort by date newest first
      const sorted = [...data].sort((a, b) => new Date(b.interviewDate).getTime() - new Date(a.interviewDate).getTime());
      setSessions(sorted);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchSessions();
  }, [fetchSessions]);

  const handleDelete = (id: string) => {
    setConfirmId(id);
  };

  const confirmDelete = async () => {
    if (!confirmId) return;
    try {
      await deleteSession(confirmId);
      fetchSessions();
    } catch {
      alert("Failed to delete session.");
    } finally {
      setConfirmId(null);
    }
  };

  const targetDelete = sessions.find(s => s.id === confirmId);

  return (
    <div className="container" style={{ minHeight: "100vh" }}>
      <header className="row" style={{ paddingBottom: "var(--spacing-md)", borderBottom: "1px solid var(--border-color)", marginBottom: "var(--spacing-lg)" }}>
        <div className="row">
          <Link to="/admin" className="muted" style={{ textDecoration: "none", marginRight: "16px" }}>[← BACK]</Link>
          <span className="badge">SESSIONS</span>
        </div>
      </header>

      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <h1 style={{ fontSize: "2.5rem" }}>Sessions</h1>
        <p className="muted">Manage and clean up interview session records</p>
      </div>

      {loading ? (
        <div className="structural-grid"><div className="grid-cell" style={{ textAlign: "center", padding: "var(--spacing-xl)" }}><p className="muted">LOADING...</p></div></div>
      ) : (
        <div className="structural-grid">
          <div className="grid-cell">
            <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-mono)", fontSize: "14px" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid var(--border-color)", textAlign: "left" }}>
                  <th style={{ padding: "12px" }}>DATE</th>
                  <th style={{ padding: "12px" }}>COMPANY</th>
                  <th style={{ padding: "12px" }}>CANDIDATE</th>
                  <th style={{ padding: "12px" }}>INTERVIEWER</th>
                  <th style={{ padding: "12px" }}>ROUND</th>
                  <th style={{ padding: "12px", textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map(session => (
                  <tr key={session.id} style={{ borderBottom: "1px solid #222" }}>
                    <td style={{ padding: "12px" }}>{new Date(session.interviewDate).toLocaleDateString()}</td>
                    <td style={{ padding: "12px" }}>{session.companyName}</td>
                    <td style={{ padding: "12px" }}>{session.candidateName || "—"}</td>
                    <td style={{ padding: "12px" }}>{session.interviewerName || "—"}</td>
                    <td style={{ padding: "12px" }}>
                      <span className="badge">{ROUND_LABELS[session.round] || session.round}</span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "right", verticalAlign: "middle" }}>
                      <button onClick={() => handleDelete(session.id)} className="btn" 
                        style={{ padding: "4px 8px", fontSize: "11px", borderColor: "#f87171", color: "#f87171" }}>
                        [DELETE]
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {sessions.length === 0 && <p className="muted" style={{ padding: "var(--spacing-md)", textAlign: "center" }}>No sessions found.</p>}
          </div>
        </div>
      )}

      {/* Confirm Delete Dialog */}
      {confirmId && targetDelete && (
        <ConfirmDialog
          message={`Delete session for ${targetDelete.companyName} on ${new Date(targetDelete.interviewDate).toLocaleDateString()}?`}
          subMessage={`This will drop ${targetDelete.questionCount || 0} question occurrences. Relevancy scores will be recomputed.`}
          onConfirm={confirmDelete}
          onCancel={() => setConfirmId(null)}
        />
      )}
    </div>
  );
}
