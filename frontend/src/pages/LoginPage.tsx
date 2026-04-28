import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function LoginPage() {
  const [email, setEmail]       = useState("");
  const [password, setPassword] = useState("");
  const [error, setError]       = useState("");
  const [loading, setLoading]   = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);

  const { signInWithEmail, signInWithGoogle, isAdmin, profile } = useAuth();
  const navigate = useNavigate();

  // Once profile loads after login, redirect based on role
  useEffect(() => {
    if (loggedIn && profile) {
      navigate(isAdmin ? "/admin" : "/dashboard", { replace: true });
    }
  }, [loggedIn, profile, isAdmin, navigate]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const err = await signInWithEmail(email, password);
    setLoading(false);
    if (err) {
      setError(`ERR_AUTH_REJECTED: ${err}`);
    } else {
      setLoggedIn(true);
    }
  };

  const handleGoogle = async () => {
    setError("");
    await signInWithGoogle();
  };

  return (
    <div className="container" style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}>
      <div className="structural-grid" style={{ width: "100%", maxWidth: "400px" }}>

        <div className="grid-cell" style={{ paddingBottom: "var(--spacing-lg)" }}>
          <div className="row" style={{ justifyContent: "space-between" }}>
            <span className="badge">AUTH.REQ</span>
            <Link to="/" className="muted" style={{ textDecoration: "none" }}>[ESC]</Link>
          </div>
          <h2 style={{ marginTop: "var(--spacing-lg)", fontSize: "2rem" }}>Access Control</h2>
        </div>

        <div className="grid-cell stack-lg">
          <form className="stack" onSubmit={handleLogin}>
            <div className="input-group">
              <label className="input-label">Ident (Email)</label>
              <input
                type="email"
                className="input-field"
                placeholder="you@example.com"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>

            <div className="input-group">
              <label className="input-label">Passkey</label>
              <input
                type="password"
                className="input-field"
                placeholder="_"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>

            {error && <p className="muted" style={{ color: "red", fontSize: "12px" }}>{error}</p>}

            <button
              type="submit"
              className="btn btn-primary"
              disabled={loading}
              style={{ marginTop: "var(--spacing-md)", width: "100%", opacity: loading ? 0.6 : 1 }}
            >
              {loading ? "[ AUTHENTICATING... ]" : "[ AUTHENTICATE ]"}
            </button>
          </form>

          <div className="stack" style={{ marginTop: "var(--spacing-md)" }}>
            <button
              type="button"
              className="btn"
              onClick={handleGoogle}
              style={{ width: "100%", fontFamily: "var(--font-mono)", justifyContent: "center" }}
            >
              [OAUTH2 :: GOOGLE]
            </button>
            <div className="row" style={{ justifyContent: "center", marginTop: "var(--spacing-sm)" }}>
              <span className="muted">NO SIGNAL?</span>
              <Link to="/signup" className="muted" style={{ color: "var(--accent-cyan)", textDecoration: "underline", textUnderlineOffset: "4px" }}>
                INITIALIZE RECORD
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
