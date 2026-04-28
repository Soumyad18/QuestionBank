import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { getAdminStats } from "@/lib/api";
import type { AdminStats } from "@/lib/types";

export function AdminDashboardPage() {
  const { profile, logout } = useAuth();
  const [stats, setStats] = useState<AdminStats | null>(null);

  useEffect(() => {
    getAdminStats().then(setStats).catch(console.error);
  }, []);

  return (
    <div className="container" style={{ minHeight: "100vh" }}>
      <header className="row" style={{ justifyContent: "space-between", paddingBottom: "var(--spacing-md)", borderBottom: "1px solid var(--border-color)", marginBottom: "var(--spacing-lg)" }}>
        <div className="row">
          <span className="badge">ADMIN_NODE</span>
          <span className="muted" style={{ marginLeft: "8px" }}>[{profile?.email}]</span>
        </div>
        <div className="row">
          <button onClick={logout} className="muted" style={{ background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>[TERM_SESSION]</button>
        </div>
      </header>

      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <h1 style={{ fontSize: "2.5rem" }}>System Dashboard</h1>
        <p className="muted">Control Center & Metrics</p>
      </div>

      {!stats ? (
        <div className="structural-grid">
          <div className="grid-cell" style={{ textAlign: "center", padding: "var(--spacing-xl)" }}>
            <p className="muted">LOADING...</p>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Widget */}
          <div className="structural-grid" style={{ marginBottom: "var(--spacing-lg)" }}>
            <div className="grid-cell" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(150px, 1fr))", gap: "var(--spacing-md)" }}>
              <div className="stack" style={{ alignItems: "center", padding: "var(--spacing-md)", border: "1px solid var(--border-color)" }}>
                <span className="muted" style={{ fontSize: "11px" }}>TOTAL QUESTIONS</span>
                <span style={{ fontSize: "2rem", color: "var(--accent-cyan)" }}>{stats.totalQuestions}</span>
              </div>
              <div className="stack" style={{ alignItems: "center", padding: "var(--spacing-md)", border: "1px solid var(--border-color)" }}>
                <span className="muted" style={{ fontSize: "11px" }}>COMPANIES</span>
                <span style={{ fontSize: "2rem", color: "var(--accent-cyan)" }}>{stats.totalCompanies}</span>
              </div>
              <div className="stack" style={{ alignItems: "center", padding: "var(--spacing-md)", border: "1px solid var(--border-color)" }}>
                <span className="muted" style={{ fontSize: "11px" }}>SESSIONS</span>
                <span style={{ fontSize: "2rem", color: "var(--accent-cyan)" }}>{stats.totalSessions}</span>
              </div>
              <div className="stack" style={{ alignItems: "center", padding: "var(--spacing-md)", border: "1px solid var(--border-color)" }}>
                <span className="muted" style={{ fontSize: "11px" }}>CANDIDATES</span>
                <span style={{ fontSize: "2rem", color: "var(--accent-cyan)" }}>{stats.totalCandidates}</span>
              </div>
            </div>
          </div>
          
          <div className="structural-grid" style={{ marginBottom: "var(--spacing-lg)" }}>
            <div className="grid-cell">
              <span className="muted" style={{ fontSize: "12px", display: "block", marginBottom: "var(--spacing-md)" }}>QUESTIONS BY IMPORTANCE</span>
              <div className="row" style={{ justifyContent: "space-around" }}>
                <div className="stack" style={{ alignItems: "center" }}>
                  <span className="badge" style={{ borderColor: "#f87171", color: "#f87171" }}>CRITICAL</span>
                  <span style={{ marginTop: "8px", fontSize: "1.2rem" }}>{stats.questionsByImportance.CRITICAL}</span>
                </div>
                <div className="stack" style={{ alignItems: "center" }}>
                  <span className="badge" style={{ borderColor: "#fb923c", color: "#fb923c" }}>HIGH</span>
                  <span style={{ marginTop: "8px", fontSize: "1.2rem" }}>{stats.questionsByImportance.HIGH}</span>
                </div>
                <div className="stack" style={{ alignItems: "center" }}>
                  <span className="badge" style={{ borderColor: "#facc15", color: "#facc15" }}>MODERATE</span>
                  <span style={{ marginTop: "8px", fontSize: "1.2rem" }}>{stats.questionsByImportance.MODERATE}</span>
                </div>
                <div className="stack" style={{ alignItems: "center" }}>
                  <span className="badge" style={{ borderColor: "#a3e635", color: "#a3e635" }}>LOW</span>
                  <span style={{ marginTop: "8px", fontSize: "1.2rem" }}>{stats.questionsByImportance.LOW}</span>
                </div>
              </div>
            </div>
          </div>

          <div style={{ marginBottom: "var(--spacing-lg)" }}>
            <h2 style={{ fontSize: "1.5rem", marginBottom: "var(--spacing-md)" }}>Control Modules</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "var(--spacing-md)" }}>
              <Link to="/admin/categories" className="btn" style={{ padding: "var(--spacing-lg)", display: "flex", flexDirection: "column", alignItems: "flex-start", height: "auto", textDecoration: "none" }}>
                <span style={{ fontSize: "1.2rem", marginBottom: "8px" }}>Categories</span>
                <span className="muted" style={{ fontSize: "12px", whiteSpace: "normal", textAlign: "left", lineHeight: "1.4" }}>Manage classification categories for AI digest constraint.</span>
              </Link>
              <Link to="/admin/tags" className="btn" style={{ padding: "var(--spacing-lg)", display: "flex", flexDirection: "column", alignItems: "flex-start", height: "auto", textDecoration: "none" }}>
                <span style={{ fontSize: "1.2rem", marginBottom: "8px" }}>Tags</span>
                <span className="muted" style={{ fontSize: "12px", whiteSpace: "normal", textAlign: "left", lineHeight: "1.4" }}>Review and delete unused auto-generated tags.</span>
              </Link>
              <Link to="/admin/companies" className="btn" style={{ padding: "var(--spacing-lg)", display: "flex", flexDirection: "column", alignItems: "flex-start", height: "auto", textDecoration: "none" }}>
                <span style={{ fontSize: "1.2rem", marginBottom: "8px" }}>Companies</span>
                <span className="muted" style={{ fontSize: "12px", whiteSpace: "normal", textAlign: "left", lineHeight: "1.4" }}>Manage company directory manually.</span>
              </Link>
              <Link to="/admin/sessions" className="btn" style={{ padding: "var(--spacing-lg)", display: "flex", flexDirection: "column", alignItems: "flex-start", height: "auto", textDecoration: "none" }}>
                <span style={{ fontSize: "1.2rem", marginBottom: "8px" }}>Sessions</span>
                <span className="muted" style={{ fontSize: "12px", whiteSpace: "normal", textAlign: "left", lineHeight: "1.4" }}>View and clean up interview session data.</span>
              </Link>
              <Link to="/admin/questions" className="btn" style={{ padding: "var(--spacing-lg)", display: "flex", flexDirection: "column", alignItems: "flex-start", height: "auto", borderColor: "var(--accent-cyan)", color: "var(--accent-cyan)", textDecoration: "none" }}>
                <span style={{ fontSize: "1.2rem", marginBottom: "8px" }}>Digest Ingestion</span>
                <span className="muted" style={{ fontSize: "12px", whiteSpace: "normal", textAlign: "left", lineHeight: "1.4", color: "var(--accent-cyan)" }}>Feed raw interview strings into the AI engine.</span>
              </Link>
              <Link to="/admin/manage" className="btn" style={{ padding: "var(--spacing-lg)", display: "flex", flexDirection: "column", alignItems: "flex-start", height: "auto", textDecoration: "none" }}>
                <span style={{ fontSize: "1.2rem", marginBottom: "8px" }}>Question Bank</span>
                <span className="muted" style={{ fontSize: "12px", whiteSpace: "normal", textAlign: "left", lineHeight: "1.4" }}>Search, edit, and curate individual questions.</span>
              </Link>
              <Link to="/admin/emails" className="btn" style={{ padding: "var(--spacing-lg)", display: "flex", flexDirection: "column", alignItems: "flex-start", height: "auto", textDecoration: "none" }}>
                <span style={{ fontSize: "1.2rem", marginBottom: "8px" }}>Email Notifications</span>
                <span className="muted" style={{ fontSize: "12px", whiteSpace: "normal", textAlign: "left", lineHeight: "1.4" }}>Send hand-picked questions to candidates via email.</span>
              </Link>
              <Link to="/admin/users" className="btn" style={{ padding: "var(--spacing-lg)", display: "flex", flexDirection: "column", alignItems: "flex-start", height: "auto", textDecoration: "none" }}>
                <span style={{ fontSize: "1.2rem", marginBottom: "8px" }}>Users</span>
                <span className="muted" style={{ fontSize: "12px", whiteSpace: "normal", textAlign: "left", lineHeight: "1.4" }}>View registered candidate details.</span>
              </Link>
            </div>
            {stats.lastDigestDate && (
               <div style={{ marginTop: "var(--spacing-md)" }}>
                <span className="muted" style={{ fontSize: "11px" }}>LAST DIGEST RUN: {new Date(stats.lastDigestDate).toLocaleString()}</span>
               </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
