import { useState } from "react";
import { Link } from "react-router-dom";
import { SignupPage } from "./SignupPage";

export function SignupAdvisoryPage() {
  const [confirmed, setConfirmed] = useState(false);

  if (confirmed) return <SignupPage />;

  return (
    <div className="container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="structural-grid" style={{ width: "100%", maxWidth: "480px" }}>

        {/* Header */}
        <div className="grid-cell">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="badge" style={{ color: "var(--accent-cyan)", borderColor: "var(--accent-cyan)" }}>
              SYS_ADVISORY
            </span>
            <Link to="/" className="muted" style={{ textDecoration: "none" }}>[ESC]</Link>
          </div>
        </div>

        {/* Body */}
        <div className="grid-cell stack">
          <div>
            <h2 style={{ fontSize: "1.8rem", marginBottom: "var(--spacing-md)" }}>
              Account Not Required
            </h2>
            <p style={{ fontFamily: "var(--font-body)", fontSize: "15px", lineHeight: 1.8, margin: 0 }}>
              You can search and browse all interview questions without creating an account.
            </p>
          </div>

          <div style={{ borderLeft: "2px solid var(--accent-cyan)", paddingLeft: "var(--spacing-md)" }}>
            <p className="muted" style={{ fontSize: "12px", lineHeight: 1.8, margin: 0 }}>
              An account will be useful in future for saving progress, rating questions, and receiving interview prep updates. If that's what you're here for — proceed.
            </p>
          </div>

          <div className="row" style={{ justifyContent: "space-between", marginTop: "var(--spacing-sm)" }}>
            <Link to="/questions" className="btn" style={{ flex: 1, justifyContent: "center" }}>
              [BROWSE WITHOUT ACCOUNT]
            </Link>
          </div>

          <div className="row" style={{ justifyContent: "space-between" }}>
            <button
              className="btn btn-primary"
              onClick={() => setConfirmed(true)}
              style={{ flex: 1, justifyContent: "center" }}
            >
              [UNDERSTOOD // CONTINUE]
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className="grid-cell">
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="muted" style={{ fontSize: "11px" }}>ALREADY REGISTERED?</span>
            <Link to="/login" className="muted" style={{ color: "var(--accent-cyan)", textDecoration: "underline", textUnderlineOffset: "4px", fontSize: "11px" }}>
              RETURN TO AUTH →
            </Link>
          </div>
        </div>

      </div>
    </div>
  );
}
