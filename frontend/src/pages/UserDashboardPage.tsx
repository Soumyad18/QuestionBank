import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { getMe, getUserDashboardStats, getMySessions, updateMe } from "@/lib/api";
import type { UserProfile, UserDashboardStats, UserSessionDetails } from "@/lib/types";
import { ROUND_COLORS } from "@/lib/categories";
import type { Round } from "@/lib/categories";

export function UserDashboardPage() {
  const { logout } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [stats, setStats] = useState<UserDashboardStats | null>(null);
  const [sessions, setSessions] = useState<UserSessionDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Edit Mode State
  const [isEditing, setIsEditing] = useState(false);
  const [editName, setEditName] = useState("");
  const [editPhone, setEditPhone] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState({ type: "", text: "" });

  // Accordion State
  const [expandedSessions, setExpandedSessions] = useState<Set<string>>(new Set());

  useEffect(() => {
    async function loadData() {
      try {
        const [profData, statsData, sessionData] = await Promise.all([
          getMe(),
          getUserDashboardStats(),
          getMySessions()
        ]);
        setProfile(profData);
        setEditName(profData.name);
        setEditPhone(profData.phone || "");
        setStats(statsData);
        setSessions(sessionData);
      } catch (err: any) {
        setError(err.message || "Failed to load dashboard data");
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setSaveMessage({ type: "", text: "" });
    try {
      const updated = await updateMe({ name: editName, phone: editPhone });
      setProfile(updated);
      setIsEditing(false);
      setSaveMessage({ type: "success", text: "Profile updated successfully." });
      setTimeout(() => setSaveMessage({ type: "", text: "" }), 3000);
    } catch (err: any) {
      setSaveMessage({ type: "error", text: err.message || "Failed to update profile." });
    } finally {
      setSaving(false);
    }
  };

  const toggleSessionExpand = (id: string) => {
    setExpandedSessions(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (loading) {
    return (
      <div className="container" style={{ padding: "var(--spacing-xl) 0", textAlign: "center" }}>
        <p className="muted">[ LOADING CLASSIFIED DATA... ]</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container" style={{ padding: "var(--spacing-xl) 0", textAlign: "center" }}>
        <p className="muted" style={{ color: "var(--accent-red)" }}>[ ERROR: {error} ]</p>
      </div>
    );
  }

  return (
    <div className="container" style={{ paddingBottom: "var(--spacing-xl)" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "var(--spacing-lg)" }}>
        <div>
          <span className="badge" style={{ marginBottom: "var(--spacing-sm)", display: "inline-block" }}>DASHBOARD</span>
          <h1 style={{ fontSize: "2.5rem" }}>User Dashboard</h1>
        </div>
        <div className="stack" style={{ alignItems: "flex-end", gap: "var(--spacing-sm)" }}>
          <Link to="/questions" className="btn btn-primary" style={{ padding: "6px 12px", textDecoration: "none" }}>[ QUESTION INDEX ]</Link>
          <button className="btn" onClick={logout} style={{ padding: "6px 12px" }}>[ LOGOUT ]</button>
        </div>
      </header>

      {/* Section 1: Profile */}
      <h2 style={{ fontSize: "1.2rem", marginBottom: "var(--spacing-sm)", color: "var(--accent-cyan)" }}>Profile Details</h2>
      <div className="structural-grid" style={{ marginBottom: "var(--spacing-lg)" }}>
        <div className="grid-cell" style={{ position: "relative" }}>
          
          <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "var(--spacing-md)" }}>
             <div>
                <span className="badge" style={{ background: profile?.isAdmin ? "var(--accent-purple)" : "var(--border-color)" }}>
                  ROLE: {profile?.isAdmin ? "ADMIN" : "USER"}
                </span>
             </div>
             <button 
                className="muted" 
                onClick={() => {
                  if (isEditing) {
                    setEditName(profile?.name || "");
                    setEditPhone(profile?.phone || "");
                  }
                  setIsEditing(!isEditing);
                }}
                style={{ background: "transparent", border: "1px solid var(--border-color)", padding: "2px 8px", cursor: "pointer", fontFamily: "var(--font-mono)", fontSize: "12px", color: isEditing ? "#facc15" : "inherit" }}
              >
                {isEditing ? "[ CANCEL EDIT ]" : "[ EDIT PROFILE ]"}
              </button>
          </div>

          <form onSubmit={handleSaveProfile} className="stack" style={{ gap: "var(--spacing-md)" }}>
            <div className="row" style={{ gap: "var(--spacing-lg)" }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Full Name</label>
                {isEditing ? (
                  <input type="text" className="input-field" value={editName} onChange={e => setEditName(e.target.value)} required />
                ) : (
                  <div style={{ fontSize: "18px", padding: "8px 0" }}>{profile?.name}</div>
                )}
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Phone Number</label>
                {isEditing ? (
                  <input type="text" className="input-field" value={editPhone} onChange={e => setEditPhone(e.target.value)} />
                ) : (
                  <div style={{ fontSize: "16px", padding: "8px 0", color: profile?.phone ? "inherit" : "var(--text-secondary)" }}>
                    {profile?.phone || "No phone number added"}
                  </div>
                )}
              </div>
            </div>
            
            <div className="row" style={{ gap: "var(--spacing-lg)" }}>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Email Address</label>
                <div style={{ fontSize: "16px", padding: "8px 0", color: "var(--text-secondary)" }}>{profile?.email}</div>
              </div>
              <div className="input-group" style={{ flex: 1 }}>
                <label className="input-label">Joined Date</label>
                <div style={{ fontSize: "16px", padding: "8px 0", color: "var(--text-secondary)" }}>
                  {profile?.createdAt ? new Date(profile.createdAt).toLocaleDateString() : "UNKNOWN"}
                </div>
              </div>
            </div>

            {isEditing && (
              <div style={{ marginTop: "var(--spacing-sm)" }}>
                <button type="submit" className="btn btn-primary" disabled={saving}>
                  {saving ? "Saving..." : "Save Profile"}
                </button>
              </div>
            )}
            
            {saveMessage.text && (
              <p style={{ color: saveMessage.type === "error" ? "#f87171" : "#4ade80", fontSize: "14px", marginTop: "8px" }}>
                {saveMessage.text}
              </p>
            )}
          </form>

        </div>
      </div>

      {/* Section 2: Stats */}
      <h2 style={{ fontSize: "1.2rem", marginBottom: "var(--spacing-sm)", color: "var(--accent-cyan)" }}>Statistics</h2>
      <div className="row" style={{ gap: "var(--spacing-md)", marginBottom: "var(--spacing-lg)", flexWrap: "wrap" }}>
        
        <div className="structural-grid" style={{ flex: "1 1 200px" }}>
          <div className="grid-cell" style={{ padding: "var(--spacing-md)" }}>
            <div className="muted" style={{ fontSize: "11px", marginBottom: "8px" }}>TOTAL INTERVIEWS</div>
            <div style={{ fontSize: "2rem", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>{stats?.totalSessions || 0}</div>
          </div>
        </div>

        <div className="structural-grid" style={{ flex: "1 1 200px" }}>
          <div className="grid-cell" style={{ padding: "var(--spacing-md)" }}>
            <div className="muted" style={{ fontSize: "11px", marginBottom: "8px" }}>COMPANIES</div>
            <div style={{ fontSize: "2rem", color: "var(--accent-cyan)", fontFamily: "var(--font-mono)" }}>{stats?.totalCompanies || 0}</div>
          </div>
        </div>

        <div className="structural-grid" style={{ flex: "1 1 200px" }}>
          <div className="grid-cell" style={{ padding: "var(--spacing-md)" }}>
            <div className="muted" style={{ fontSize: "11px", marginBottom: "8px" }}>LAST INTERVIEW</div>
            <div style={{ fontSize: "1.5rem", color: "var(--text-primary)", fontFamily: "var(--font-mono)" }}>
              {stats?.lastInterviewDate || "N/A"}
            </div>
          </div>
        </div>

      </div>

      {/* Section 3: My Sessions */}
      <h2 style={{ fontSize: "1.2rem", marginBottom: "var(--spacing-sm)", color: "var(--accent-cyan)" }}>Interview Sessions</h2>
      
      {sessions.length === 0 ? (
        <div className="structural-grid">
          <div className="grid-cell" style={{ padding: "var(--spacing-xl)", textAlign: "center" }}>
            <p className="muted" style={{ fontSize: "16px" }}>No interview sessions found.</p>
            <p className="muted" style={{ marginTop: "8px", fontSize: "13px" }}>Link your profile with ongoing sessions to see them here.</p>
          </div>
        </div>
      ) : (
        <div className="stack" style={{ gap: "var(--spacing-md)" }}>
          {sessions.map(session => {
            const isExpanded = expandedSessions.has(session.id);
            const roundColor = ROUND_COLORS[session.round as Round] || "var(--border-color)";

            return (
              <div key={session.id} className="structural-grid">
                <div className="grid-cell" style={{ padding: 0 }}>
                  
                  {/* Session Header (Clickable Toggle) */}
                  <div 
                    onClick={() => toggleSessionExpand(session.id)}
                    style={{ 
                      padding: "var(--spacing-md)", 
                      cursor: "pointer", 
                      display: "flex", 
                      justifyContent: "space-between", 
                      alignItems: "center",
                      borderBottom: isExpanded ? "1px solid var(--border-color)" : "none",
                      backgroundColor: isExpanded ? "rgba(255,255,255,0.02)" : "transparent"
                    }}
                  >
                    <div style={{ display: "flex", alignItems: "center", gap: "var(--spacing-md)" }}>
                      <span style={{ fontSize: "20px", fontWeight: "bold" }}>{session.companyName}</span>
                      <span className="badge" style={{ backgroundColor: roundColor, color: "var(--bg-primary)" }}>{session.round}</span>
                    </div>
                    
                    <div className="row" style={{ gap: "var(--spacing-lg)" }}>
                      <div className="muted" style={{ fontSize: "12px", display: "flex", flexDirection: "column", alignItems: "flex-end" }}>
                        <span style={{ color: "var(--text-secondary)" }}>{session.interviewDate}</span>
                        <span>{session.interviewerName || "UNKNOWN INTERVIEWER"}</span>
                      </div>
                      <div className="muted" style={{ fontSize: "12px", width: "80px", textAlign: "right" }}>
                        {session.questions.length} LOGS
                        <span style={{ marginLeft: "8px" }}>{isExpanded ? "▲" : "▼"}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expanded Questions Accordion */}
                  {isExpanded && (
                    <div style={{ padding: "var(--spacing-md)" }}>
                      {session.questions.length === 0 ? (
                        <p className="muted" style={{ textAlign: "center" }}>No logs attached to this session.</p>
                      ) : (
                        <div className="stack" style={{ gap: "12px" }}>
                          {session.questions.map(q => {
                            let labelColor = "var(--text-secondary)";
                            if (q.relevancyLabel === "CRITICAL") labelColor = "#f87171";
                            else if (q.relevancyLabel === "HIGH") labelColor = "#fb923c";
                            else if (q.relevancyLabel === "MODERATE") labelColor = "#facc15";

                            return (
                              <div key={q.id} style={{ borderLeft: `2px solid ${labelColor}`, paddingLeft: "12px", paddingBottom: "12px", borderBottom: "1px dashed var(--border-color)" }}>
                                <p style={{ fontSize: "16px", marginBottom: "8px", lineHeight: "1.5" }}>{q.text}</p>
                                <div className="row" style={{ flexWrap: "wrap", gap: "6px" }}>
                                  <span className="badge" style={{ fontSize: "10px", borderColor: "var(--accent-purple)", color: "var(--accent-purple)" }}>CAT: {q.category.toUpperCase()}</span>
                                  {q.tags.map(t => (
                                    <span key={t} className="muted" style={{ fontSize: "11px" }}>#{t}</span>
                                  ))}
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </div>
                  )}

                </div>
              </div>
            );
          })}
        </div>
      )}

    </div>
  );
}
