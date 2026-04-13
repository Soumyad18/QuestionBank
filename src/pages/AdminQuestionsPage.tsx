import { useState } from "react";
import { useAuth } from "../lib/auth";

export function AdminQuestionsPage() {
  const [inputText, setInputText] = useState("");
  const [status, setStatus] = useState<"IDLE" | "PROCESSING" | "SUCCESS">("IDLE");
  const { logout, user } = useAuth();

  const handleDigest = () => {
    if (!inputText.trim()) return;

    setStatus("PROCESSING");
    
    // Simulate AI processing / backend save
    setTimeout(() => {
      setStatus("SUCCESS");
      setInputText("");
      
      // Reset success message after a few seconds
      setTimeout(() => {
        setStatus("IDLE");
      }, 3000);
    }, 800);
  };

  return (
    <div className="container" style={{ minHeight: "100vh", display: "flex", flexDirection: "column" }}>
      
      {/* Header */}
      <header className="row" style={{ justifyContent: "space-between", paddingBottom: "var(--spacing-md)", borderBottom: "1px solid var(--border-color)" }}>
        <div className="row">
          <span className="badge">ADMIN_NODE</span>
          <span className="muted" style={{ marginLeft: "8px" }}>[{user?.email}]</span>
        </div>
        <button onClick={logout} className="muted" style={{ background: "none", border: "none", cursor: "pointer", textDecoration: "underline" }}>
          [TERM_SESSION]
        </button>
      </header>
      
      {/* Main Body */}
      <section className="stack" style={{ flexGrow: 1, paddingTop: "var(--spacing-lg)", display: "flex", flexDirection: "column" }}>
        
        <div className="row" style={{ justifyContent: "space-between", alignItems: "flex-end" }}>
          <div>
            <h1 style={{ fontSize: "2.5rem" }}>Data Ingestion Module</h1>
            <p className="muted">Drop raw, unstructured interview questions below. System will parse, tag, and index automatically.</p>
          </div>
          {status === "SUCCESS" && (
            <span className="badge" style={{ color: "var(--accent-cyan)", borderColor: "var(--accent-cyan)" }}>
              ✓ BATCH_INGESTED_SUCCESSFULLY
            </span>
          )}
        </div>

        {/* Massive Input Area */}
        <div style={{ flexGrow: 1, display: "flex", flexDirection: "column", padding: "var(--spacing-md) 0" }}>
          <textarea 
            className="input-field" 
            placeholder="[ PASTE RAW TEXT HERE... ]"
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            disabled={status === "PROCESSING"}
            style={{ 
              flexGrow: 1, 
              width: "100%", 
              minHeight: "400px", 
              resize: "none", 
              fontFamily: "var(--font-mono)", 
              fontSize: "14px",
              lineHeight: 1.8,
              border: "1px solid var(--border-color)",
              padding: "var(--spacing-md)",
              backgroundColor: "rgba(255, 255, 255, 0.02)"
            }}
          />
        </div>
        
        {/* Action Bar */}
        <div className="row" style={{ justifyContent: "flex-end", paddingTop: "var(--spacing-md)" }}>
           <button 
             className="btn btn-primary" 
             onClick={handleDigest}
             disabled={status === "PROCESSING" || !inputText.trim()}
             style={{ 
               fontSize: "16px", 
               padding: "16px 48px",
               opacity: status === "PROCESSING" ? 0.5 : 1
             }}
           >
             {status === "PROCESSING" ? "[ PROCESSING... ]" : "[ PROCESS // DIGEST ]"}
           </button>
        </div>
      </section>

    </div>
  );
}
