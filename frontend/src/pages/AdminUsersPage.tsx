import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { getAdminUsers, toggleAdmin, linkCandidate, getSessions } from "@/lib/api";
import { ConfirmDialog } from "@/components/confirm-dialog";
import type { UserProfile, Session } from "@/lib/types";
import { ROUND_LABELS } from "@/lib/categories";

export function AdminUsersPage() {
  useAuth();
  const [users,   setUsers]   = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(false);
  const [search,  setSearch]  = useState("");

  // Toggle admin confirm
  const [confirmToggle, setConfirmToggle] = useState<UserProfile | null>(null);

  // Session linking modal
  const [linkingUser,    setLinkingUser]    = useState<UserProfile | null>(null);
  const [sessions,       setSessions]       = useState<Session[]>([]);
  const [sessionsLoading,setSessionsLoading]= useState(false);
  const [linkStatus,     setLinkStatus]     = useState<Record<string, "LINKING" | "DONE" | "ERROR">>({});

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    try { setUsers(await getAdminUsers()); }
    finally { setLoading(false); }
  }, []);

  useEffect(() => { fetchUsers(); }, [fetchUsers]);

  const handleToggleAdmin = async () => {
    if (!confirmToggle) return;
    try {
      const updated = await toggleAdmin(confirmToggle.id);
      setUsers(prev => prev.map(u => u.id === updated.id ? updated : u));
    } catch { alert("Failed to update admin status."); }
    finally { setConfirmToggle(null); }
  };

  const openSessionLinker = async (user: UserProfile) => {
    setLinkingUser(user);
    setSessionsLoading(true);
    try { setSessions(await getSessions()); }
    finally { setSessionsLoading(false); }
  };

  const handleLink = async (sessionId: string) => {
    if (!linkingUser) return;
    setLinkStatus(prev => ({ ...prev, [sessionId]: "LINKING" }));
    try {
      await linkCandidate(sessionId, linkingUser.id);
      setLinkStatus(prev => ({ ...prev, [sessionId]: "DONE" }));
    } catch {
      setLinkStatus(prev => ({ ...prev, [sessionId]: "ERROR" }));
    }
  };

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="container" style={{ minHeight: "100vh" }}>
      <header className="row" style={{ paddingBottom: "var(--spacing-md)", borderBottom: "1px solid var(--border-color)", marginBottom: "var(--spacing-lg)" }}>
        <div className="row">
          <Link to="/admin" className="muted" style={{ textDecoration: "none", marginRight: "16px" }}>[← BACK]</Link>
          <span className="badge">USERS</span>
        </div>
      </header>

      <div style={{ marginBottom: "var(--spacing-lg)", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
        <div>
          <h1 style={{ fontSize: "2.5rem" }}>Users</h1>
          <p className="muted">{users.length} registered candidates</p>
        </div>
      </div>

      {/* Search */}
      <div className="structural-grid" style={{ marginBottom: "var(--spacing-md)" }}>
        <div className="grid-cell" style={{ padding: "var(--spacing-md)" }}>
          <input type="text" className="input-field" placeholder="Search by name or email..."
            value={search} onChange={e => setSearch(e.target.value)} style={{ fontSize: "16px" }} />
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
                  <th style={{ padding: "12px" }}>NAME</th>
                  <th style={{ padding: "12px" }}>EMAIL</th>
                  <th style={{ padding: "12px" }}>PHONE</th>
                  <th style={{ padding: "12px" }}>SESSIONS</th>
                  <th style={{ padding: "12px" }}>JOINED</th>
                  <th style={{ padding: "12px" }}>ROLE</th>
                  <th style={{ padding: "12px", textAlign: "right" }}>ACTIONS</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(user => (
                  <tr key={user.id} style={{ borderBottom: "1px solid #222" }}>
                    <td style={{ padding: "12px" }}>{user.name}</td>
                    <td style={{ padding: "12px", color: "var(--text-secondary)" }}>{user.email}</td>
                    <td style={{ padding: "12px", color: "var(--text-secondary)" }}>{user.phone || "—"}</td>
                    <td style={{ padding: "12px" }}>{user.sessionCount}</td>
                    <td style={{ padding: "12px", color: "var(--text-secondary)" }}>
                      {new Date(user.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: "12px" }}>
                      <span className="badge" style={{
                        fontSize: "10px",
                        color: user.isAdmin ? "#facc15" : "var(--text-secondary)",
                        borderColor: user.isAdmin ? "#facc15" : "var(--border-color)"
                      }}>
                        {user.isAdmin ? "ADMIN" : "USER"}
                      </span>
                    </td>
                    <td style={{ padding: "12px", textAlign: "right" }}>
                      <button onClick={() => setConfirmToggle(user)} className="btn"
                        style={{ padding: "4px 8px", fontSize: "11px", marginRight: "8px",
                          color: user.isAdmin ? "#f87171" : "#4ade80",
                          borderColor: user.isAdmin ? "#f87171" : "#4ade80" }}>
                        {user.isAdmin ? "[REVOKE ADMIN]" : "[MAKE ADMIN]"}
                      </button>
                      <button onClick={() => openSessionLinker(user)} className="btn"
                        style={{ padding: "4px 8px", fontSize: "11px" }}>
                        [LINK SESSION]
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && <p className="muted" style={{ padding: "var(--spacing-md)", textAlign: "center" }}>No users found.</p>}
          </div>
        </div>
      )}

      {/* Toggle Admin Confirm */}
      {confirmToggle && (
        <ConfirmDialog
          message={confirmToggle.isAdmin
            ? `Revoke admin access from ${confirmToggle.name}?`
            : `Grant admin access to ${confirmToggle.name}?`}
          subMessage={confirmToggle.isAdmin
            ? "This user will lose access to all admin pages."
            : "This user will have full admin access to the system."}
          onConfirm={handleToggleAdmin}
          onCancel={() => setConfirmToggle(null)}
        />
      )}

      {/* Session Linking Modal */}
      {linkingUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: "var(--spacing-md)" }}>
          <div className="structural-grid" style={{ width: "100%", maxWidth: "700px", maxHeight: "85vh", overflowY: "auto" }}>
            <div className="grid-cell">
              <div className="row" style={{ justifyContent: "space-between" }}>
                <div className="row">
                  <span className="badge" style={{ color: "var(--accent-cyan)", borderColor: "var(--accent-cyan)" }}>LINK_SESSION</span>
                  <span className="muted" style={{ fontSize: "12px" }}>{linkingUser.name} — {linkingUser.email}</span>
                </div>
                <button onClick={() => { setLinkingUser(null); setLinkStatus({}); }} className="muted"
                  style={{ background: "none", border: "none", cursor: "pointer" }}>[✕ CLOSE]</button>
              </div>
            </div>
            <div className="grid-cell">
              <p className="muted" style={{ marginBottom: "var(--spacing-md)", fontSize: "13px" }}>
                Select sessions to link to this candidate. Sessions already linked to someone else are shown in muted.
              </p>
              {sessionsLoading ? (
                <p className="muted">LOADING SESSIONS...</p>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse", fontFamily: "var(--font-mono)", fontSize: "13px" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid var(--border-color)" }}>
                      <th style={{ padding: "8px", textAlign: "left" }}>DATE</th>
                      <th style={{ padding: "8px", textAlign: "left" }}>COMPANY</th>
                      <th style={{ padding: "8px", textAlign: "left" }}>ROUND</th>
                      <th style={{ padding: "8px", textAlign: "left" }}>INTERVIEWER</th>
                      <th style={{ padding: "8px", textAlign: "right" }}>ACTION</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sessions.map(s => {
                      const status = linkStatus[s.id];
                      return (
                        <tr key={s.id} style={{ borderBottom: "1px solid #222" }}>
                          <td style={{ padding: "8px" }}>{new Date(s.interviewDate).toLocaleDateString()}</td>
                          <td style={{ padding: "8px" }}>{s.companyName}</td>
                          <td style={{ padding: "8px" }}>
                            <span className="badge" style={{ fontSize: "10px" }}>{ROUND_LABELS[s.round] || s.round}</span>
                          </td>
                          <td style={{ padding: "8px", color: "var(--text-secondary)" }}>{s.interviewerName || "—"}</td>
                          <td style={{ padding: "8px", textAlign: "right" }}>
                            {status === "DONE" ? (
                              <span className="badge" style={{ color: "#4ade80", borderColor: "#4ade80", fontSize: "10px" }}>✓ LINKED</span>
                            ) : status === "ERROR" ? (
                              <span className="badge" style={{ color: "#f87171", borderColor: "#f87171", fontSize: "10px" }}>✗ ERROR</span>
                            ) : (
                              <button onClick={() => handleLink(s.id)} className="btn"
                                disabled={status === "LINKING"}
                                style={{ padding: "2px 8px", fontSize: "10px", opacity: status === "LINKING" ? 0.5 : 1 }}>
                                {status === "LINKING" ? "[LINKING...]" : "[LINK]"}
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
