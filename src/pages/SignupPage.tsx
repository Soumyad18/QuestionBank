import { Link } from "react-router-dom";

export function SignupPage() {
  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    // No backend wired yet for real registration. Mock success.
    alert("SYS_MSG: Registration request logged. Waiting for admin approval.");
  };

  return (
    <div className="container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="structural-grid" style={{ width: "100%", maxWidth: "400px" }}>
        
        <div className="grid-cell" style={{ paddingBottom: "var(--spacing-lg)" }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="badge">REGISTRATION</span>
            <Link to="/" className="muted" style={{ textDecoration: "none" }}>[ESC]</Link>
          </div>
          <h2 style={{ marginTop: "var(--spacing-lg)", fontSize: "2rem" }}>Initialize Record</h2>
        </div>
        
        <div className="grid-cell stack-lg">
          <form className="stack" onSubmit={handleSignup}>
            <div className="input-group">
              <label className="input-label">Handle (Name)</label>
              <input type="text" className="input-field" placeholder="_" required />
            </div>

            <div className="input-group">
              <label className="input-label">Ident (Email)</label>
              <input type="email" className="input-field" placeholder="_" required />
            </div>
            
            <div className="input-group">
              <label className="input-label">Passkey</label>
              <input type="password" className="input-field" placeholder="_" required />
            </div>
            
            <button type="submit" className="btn btn-primary" style={{ marginTop: "var(--spacing-md)", width: "100%" }}>
              Generate Identity
            </button>
          </form>

          {/* Social Auth & Links */}
          <div className="stack" style={{ marginTop: "var(--spacing-md)" }}>
             <button type="button" className="btn" style={{ width: "100%", fontFamily: "var(--font-mono)", justifyContent: "center" }}>
               [OAUTH2 :: GOOGLE]
             </button>
             <div className="row" style={{ justifyContent: "center", marginTop: "var(--spacing-sm)" }}>
               <span className="muted">KNOWN IDENT?</span>
               <Link to="/login" className="muted" style={{ color: "var(--accent-cyan)", textDecoration: "underline", textUnderlineOffset: "4px" }}>
                 RETURN TO AUTH
               </Link>
             </div>
          </div>

          <div className="row" style={{ justifyContent: "space-between", marginTop: "var(--spacing-md)" }}>
            <span className="muted">v0.1.0</span>
            <span className="muted">SECURE_CHANNEL</span>
          </div>
        </div>
        
      </div>
    </div>
  );
}
