import { useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../lib/auth";

export function SignupPage() {
  const [name,     setName]     = useState("");
  const [email,    setEmail]    = useState("");
  const [phone,    setPhone]    = useState("");
  const [password, setPassword] = useState("");
  const [error,    setError]    = useState("");
  const [success,  setSuccess]  = useState(false);
  const [loading,  setLoading]  = useState(false);

  const { signUpWithEmail, signInWithGoogle } = useAuth();

  const handleSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const err = await signUpWithEmail(email, password, name, phone);
    setLoading(false);
    if (err) {
      setError(`ERR_REGISTRATION: ${err}`);
    } else {
      setSuccess(true);
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
            <span className="badge">REGISTRATION</span>
            <Link to="/" className="muted" style={{ textDecoration: "none" }}>[ESC]</Link>
          </div>
          <h2 style={{ marginTop: "var(--spacing-lg)", fontSize: "2rem" }}>Initialize Record</h2>
        </div>

        <div className="grid-cell stack-lg">
          {success ? (
            <div style={{ textAlign: "center" }}>
              <span className="badge" style={{ color: "var(--accent-cyan)", borderColor: "var(--accent-cyan)" }}>
                ✓ RECORD_INITIALIZED
              </span>
              <p className="muted" style={{ marginTop: "var(--spacing-md)" }}>
                Check your email to confirm your account. Redirecting to login...
              </p>
            </div>
          ) : (
            <form className="stack" onSubmit={handleSignup}>
              <div className="input-group">
                <label className="input-label">Full Name</label>
                <input
                  type="text"
                  className="input-field"
                  placeholder="_"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Email</label>
                <input
                  type="email"
                  className="input-field"
                  placeholder="_"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Phone Number</label>
                <input
                  type="tel"
                  className="input-field"
                  placeholder="+91 XXXXX XXXXX"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                />
              </div>

              <div className="input-group">
                <label className="input-label">Password</label>
                <input
                  type="password"
                  className="input-field"
                  placeholder="_"
                  required
                  minLength={6}
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
                {loading ? "[ INITIALIZING... ]" : "[ CREATE ACCOUNT ]"}
              </button>
            </form>
          )}

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
              <span className="muted">ALREADY REGISTERED?</span>
              <Link to="/login" className="muted" style={{ color: "var(--accent-cyan)", textDecoration: "underline", textUnderlineOffset: "4px" }}>
                LOGIN
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
