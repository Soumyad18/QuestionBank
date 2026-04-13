import { Link } from "react-router-dom";

export function HomePage() {
  return (
    <div className="container">
      {/* HERO SECTION */}
      <section className="structural-grid" style={{ borderBottom: "none" }}>
        <div className="grid-cell" style={{ padding: "var(--spacing-xl) var(--spacing-lg) calc(var(--spacing-xl) * 2)" }}>
          <div className="badge" style={{ marginBottom: "var(--spacing-md)", display: "inline-block" }}>
            SYS.INIT // AIP-01
          </div>
          <h1 style={{ fontSize: "clamp(3rem, 8vw, 6rem)", lineHeight: 1, marginBottom: "var(--spacing-md)" }}>
            Decode the <br />
            <span style={{ color: "var(--text-secondary)" }}>Interview.</span>
          </h1>
          <p className="muted" style={{ maxWidth: "600px", fontSize: "16px" }}>
            An immutable ledger of technical interview questions. 
            Curated by engineers. Structured by AI. Designed for speed.
          </p>
          
          <div className="row" style={{ marginTop: "var(--spacing-lg)" }}>
            <Link to="/questions" className="btn btn-primary">Initialize Search</Link>
            <Link to="/login" className="btn">Admin Auth</Link>
          </div>
        </div>
      </section>

      {/* FEATURE GRID */}
      <section className="structural-grid cols-3">
        <div className="grid-cell stack">
          <div className="row">
            <span className="badge">01</span>
            <span className="muted">ARCHITECTURE</span>
          </div>
          <h3>Centralized Index</h3>
          <p className="muted">
            Raw questions extracted from unstructured channels and forged into a single source of truth.
          </p>
        </div>
        
        <div className="grid-cell stack">
          <div className="row">
            <span className="badge">02</span>
            <span className="muted">INTELLIGENCE</span>
          </div>
          <h3>AI Taxonomies</h3>
          <p className="muted">
            Auto-generated tagging and structural metadata mapping to identify technical patterns.
          </p>
        </div>

        <div className="grid-cell stack">
          <div className="row">
            <span className="badge">03</span>
            <span className="muted">VELOCITY</span>
          </div>
          <h3>O(1) Discovery</h3>
          <p className="muted">
            Instantaneous search and multi-dimensional filtering over thousands of data points.
          </p>
        </div>
      </section>
    </div>
  );
}
