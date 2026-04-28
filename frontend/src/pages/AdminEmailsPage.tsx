import { useState, useEffect, useCallback } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/lib/auth";
import { getAdminUsers, searchQuestions, sendEmails, getCompanies } from "@/lib/api";
import { ROUNDS, ROUND_LABELS } from "@/lib/categories";
import type { UserProfile, Question, PageResponse, Company } from "@/lib/types";

const getOrdinal = (n: number) => {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
};

const formatFancyDate = (dateStr: string) => {
  if (!dateStr) return "No Date";
  const [y, m, d] = dateStr.split("-");
  const date = new Date(parseInt(y, 10), parseInt(m, 10) - 1, parseInt(d, 10));
  const month = date.toLocaleString('en-US', { month: 'long' });
  return `${getOrdinal(parseInt(d, 10))} ${month}, ${y}`;
};

export function AdminEmailsPage() {
  useAuth();
  
  const [candidates, setCandidates] = useState<UserProfile[]>([]);
  const [recipientQuery, setRecipientQuery] = useState("");
  const [selectedCandidates, setSelectedCandidates] = useState<Set<string>>(new Set());

  const [companies, setCompanies] = useState<Company[]>([]);
  const [company, setCompany] = useState("");
  const [round, setRound] = useState("");

  const [result, setResult] = useState<PageResponse<Question> | null>(null);
  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewerName, setInterviewerName] = useState("");

  const [sending, setSending] = useState(false);
  const [status, setStatus] = useState("");

  useEffect(() => {
    getAdminUsers().then(setCandidates).catch(console.error);
    getCompanies().then(setCompanies).catch(console.error);
  }, []);

  const fetchQuestions = useCallback(async () => {
    setLoading(true);
    try {
      const data = await searchQuestions({ search: "", company, round, page: 0, size: 50 });
      setResult(data);
    } catch {
      //
    } finally {
      setLoading(false);
    }
  }, [company, round]);

  useEffect(() => {
    const t = setTimeout(() => fetchQuestions(), 400);
    return () => clearTimeout(t);
  }, [company, round, fetchQuestions]);

  const handleToggleCandidate = (id: string) => {
    setSelectedCandidates(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSend = async () => {
    if (selectedCandidates.size === 0) { setStatus("ERR: Candidate unselected."); return; }
    if (!result || result.page.totalElements === 0) { setStatus("ERR: No items targeted."); return; }
    
    setSending(true);
    setStatus("TRANSMITTING...");
    try {
      const selectedList = candidates.filter(c => selectedCandidates.has(c.id));
      const recipients = selectedList.map(c => ({
        email: c.email,
        name: c.name,
        company: company || "ALL COMPANIES",
        round: round || "ALL ROUNDS",
        date: interviewDate || new Date().toISOString().split('T')[0]
      }));

      const filters = { company, round };

      const res = await sendEmails({ recipients, filters });
      
      if (res.errors && res.errors.length > 0) {
        setStatus(`PARTIAL: ${res.emailsSent} sent. ${res.errors.length} errors.`);
      } else {
        setStatus(`SUCCESS: Package delivered to ${res.emailsSent} applicant(s).`);
      }

      setSelectedCandidates(new Set()); // reset recipients
      setRecipientQuery("");
      setCompany("");
      setRound("");
      setMessage("");
      setInterviewDate("");
      setInterviewerName("");
    } catch {
      setStatus("ERROR: Subsystem fault.");
    } finally {
      setSending(false);
    }
  };

  const filteredCandidates = candidates.filter(c => {
    const nameMatch = c.name ? c.name.toLowerCase().includes(recipientQuery.toLowerCase()) : false;
    const emailMatch = c.email ? c.email.toLowerCase().includes(recipientQuery.toLowerCase()) : false;
    return nameMatch || emailMatch;
  });

  const companyName = company ? companies.find(c => c.slug === company)?.name : "ALL COMPANIES";
  const roundName = round ? ROUND_LABELS[round as keyof typeof ROUND_LABELS] : "ALL ROUNDS";
  const questionsCount = result?.page.totalElements || 0;
  
  const defaultMessage = `This is an automated email regarding your upcoming ${roundName !== "ALL ROUNDS" ? roundName : "interview"} round at ${companyName !== "ALL COMPANIES" ? companyName : "[Company]"}. Please review the attached questions and prepare well. Best of luck!`;
  const actualMessage = message.trim() ? message : defaultMessage;

  return (
    <div className="container" style={{ minHeight: "100vh", paddingBottom: "var(--spacing-xl)" }}>
      <header className="row" style={{ paddingBottom: "var(--spacing-md)", borderBottom: "1px solid var(--border-color)", marginBottom: "var(--spacing-lg)" }}>
        <div className="row">
          <Link to="/admin" className="muted" style={{ textDecoration: "none", marginRight: "16px" }}>[← BACK]</Link>
          <span className="badge">DIRECT_MAILER</span>
        </div>
      </header>

      <div style={{ marginBottom: "var(--spacing-lg)" }}>
        <h1 style={{ fontSize: "2.5rem" }}>Transmission Module</h1>
        <p className="muted">Directly dispatch test structures to applicant endpoints.</p>
      </div>

      <div className="structural-grid" style={{ marginBottom: "var(--spacing-lg)" }}>
        <div className="grid-cell stack">
          <h2 style={{ fontSize: "1.2rem", marginBottom: "var(--spacing-md)" }}>1. Select Recipient(s)</h2>
          <div className="input-group">
            <input 
              type="text" 
              className="input-field" 
              placeholder="Search candidate by name or email..." 
              value={recipientQuery}
              onChange={e => setRecipientQuery(e.target.value)}
            />
          </div>
          <div style={{ marginTop: "var(--spacing-md)", maxHeight: "200px", overflowY: "auto", border: "1px solid var(--border-color)", padding: "var(--spacing-sm)" }}>
            {filteredCandidates.length === 0 ? <p className="muted">NO CANDIDATES MATCHING QUERY.</p> : (
              filteredCandidates.map(c => {
                 const isSelected = selectedCandidates.has(c.id);
                 return (
                   <div key={c.id} className="row" style={{ padding: "var(--spacing-sm)", borderBottom: "1px solid rgba(255,255,255,0.05)", cursor: "pointer", background: isSelected ? "rgba(45, 212, 191, 0.1)" : "transparent", alignItems: "center" }} onClick={() => handleToggleCandidate(c.id)}>
                     <div style={{ flexGrow: 1, paddingLeft: "var(--spacing-sm)" }}>
                       <span style={{ fontSize: "14px", fontFamily: "var(--font-body)", color: isSelected ? "var(--accent-cyan)" : "var(--text-primary)" }}>{c.name}</span>
                       <span className="muted" style={{ marginLeft: "12px", fontSize: "12px" }}>{c.email}</span>
                     </div>
                     <div style={{ width: "24px", display: "flex", justifyContent: "center" }}>
                       <input type="checkbox" checked={isSelected} readOnly style={{ accentColor: "var(--accent-cyan)", width: "16px", height: "16px", cursor: "pointer" }} />
                     </div>
                   </div>
                 );
              })
            )}
          </div>
          <div style={{ marginTop: "8px", display: "flex", flexDirection: "column", gap: "4px" }}>
            <span className="muted">Selected candidates: <span style={{ color: "var(--accent-cyan)" }}>{selectedCandidates.size}</span></span>
            {selectedCandidates.size > 0 && (
              <span style={{ fontSize: "12px", color: "var(--accent-cyan)" }}>
                {Array.from(selectedCandidates).map(id => candidates.find(c => c.id === id)?.name).filter(Boolean).join(", ")}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="structural-grid" style={{ marginBottom: "var(--spacing-lg)" }}>
        <div className="grid-cell stack">
          <h2 style={{ fontSize: "1.2rem", marginBottom: "var(--spacing-md)" }}>2. Target Payload Filters</h2>
          <p className="muted" style={{ marginBottom: "var(--spacing-md)", fontSize: "14px", lineHeight: "1.5" }}>
            Select the required criteria. The module will automatically queue all queries matching the specified boundaries.
          </p>
          <div className="row" style={{ gap: "var(--spacing-md)", display: "flex", flexWrap: "wrap" }}>
            <div className="input-group" style={{ width: "250px" }}>
              <select className="input-field" value={company} onChange={e => setCompany(e.target.value)}>
                <option value="">ALL COMPANIES</option>
                {companies.map(c => <option key={c.slug} value={c.slug}>{c.name}</option>)}
              </select>
            </div>
            <div className="input-group" style={{ width: "250px" }}>
              <select className="input-field" value={round} onChange={e => setRound(e.target.value)}>
                <option value="">ALL ROUNDS</option>
                {ROUNDS.map(r => <option key={r} value={r}>{ROUND_LABELS[r]}</option>)}
              </select>
            </div>
          </div>
        </div>
      </div>

      <div className="structural-grid" style={{ marginBottom: "var(--spacing-lg)" }}>
        <div className="grid-cell stack">
          <h2 style={{ fontSize: "1.2rem", marginBottom: "var(--spacing-md)" }}>3. Message Details</h2>
          <p className="muted" style={{ marginBottom: "var(--spacing-md)", fontSize: "14px", lineHeight: "1.5" }}>
            Add personalized context. This will be transmitted along with the target payloads.
          </p>
          <div className="row" style={{ gap: "var(--spacing-md)", marginBottom: "var(--spacing-md)" }}>
            <div className="input-group" style={{ flexGrow: 1 }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "var(--text-secondary)" }}>Interview Date</label>
              <input type="date" className="input-field" value={interviewDate} onChange={e => setInterviewDate(e.target.value)} />
            </div>
            <div className="input-group" style={{ flexGrow: 1 }}>
              <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "var(--text-secondary)" }}>Interviewer Name</label>
              <input type="text" className="input-field" placeholder="e.g. John Doe, Cyber Division" value={interviewerName} onChange={e => setInterviewerName(e.target.value)} />
            </div>
          </div>
          <div className="input-group">
             <label style={{ display: "block", marginBottom: "4px", fontSize: "12px", color: "var(--text-secondary)" }}>Transmission Message</label>
             <textarea className="input-field" rows={4} placeholder={defaultMessage} value={message} onChange={e => setMessage(e.target.value)}></textarea>
          </div>
        </div>
      </div>

      <div className="structural-grid">
        <div className="grid-cell stack">
          <h2 style={{ fontSize: "1.2rem", marginBottom: "var(--spacing-md)" }}>4. Pre-flight Verification</h2>
          <div style={{ padding: "var(--spacing-md)", background: "rgba(0,0,0,0.2)", border: "1px solid var(--border-color)", borderLeft: "4px solid var(--accent-cyan)" }}>
            <h3 style={{ fontSize: "16px", marginBottom: "16px", color: "var(--text-primary)" }}>Transmission Summary</h3>
            
            <div className="row" style={{ alignItems: "flex-start", marginBottom: "12px" }}>
              <div style={{ width: "120px" }}><strong className="muted">Recipients:</strong></div>
              <div style={{ flexGrow: 1, color: "var(--accent-cyan)", fontSize: "14px" }}>
                 {selectedCandidates.size === 0 ? "None Selected" : `${selectedCandidates.size} Candidate(s)`}
                 {selectedCandidates.size > 0 && (
                   <div style={{ fontSize: "12px", color: "var(--text-secondary)", marginTop: "4px" }}>
                     {Array.from(selectedCandidates).map(id => candidates.find(c => c.id === id)?.name).join(", ")}
                   </div>
                 )}
              </div>
            </div>

            <div className="row" style={{ alignItems: "flex-start", marginBottom: "12px" }}>
               <div style={{ width: "120px" }}><strong className="muted">Filter Target:</strong></div>
               <div style={{ flexGrow: 1, color: "var(--accent-cyan)", fontSize: "14px" }}>
                  {companyName} — {roundName}
               </div>
            </div>

            <div className="row" style={{ alignItems: "flex-start", marginBottom: "12px" }}>
               <div style={{ width: "120px" }}><strong className="muted">Meta Overlay:</strong></div>
               <div style={{ flexGrow: 1, color: "var(--text-secondary)", fontSize: "14px" }}>
                  Date: {interviewDate ? formatFancyDate(interviewDate) : "Unknown"} | Interviewer: {interviewerName || "Unknown"}
                  {actualMessage && <div style={{ marginTop: "4px", fontStyle: "italic", color: "var(--text-primary)" }}>"{actualMessage.length > 80 ? actualMessage.substring(0, 80) + "..." : actualMessage}"</div>}
               </div>
            </div>

            <div className="row" style={{ alignItems: "flex-start" }}>
               <div style={{ width: "120px" }}><strong className="muted">Payload Size:</strong></div>
               <div style={{ flexGrow: 1, color: "var(--accent-cyan)", fontSize: "14px" }}>
                  {loading ? "CALCULATING..." : `${questionsCount} questions attached (PDF Payload)`}
               </div>
            </div>
            
            {!loading && questionsCount > 0 && (
               <div style={{ marginTop: "24px", padding: "16px", background: "rgba(255,255,255,0.02)", border: "1px dashed rgba(255,255,255,0.1)" }}>
                 <p className="muted" style={{ marginBottom: "12px", fontSize: "12px", textTransform: "uppercase" }}>Payload Sample Data</p>
                 {result?.content.slice(0, 5).map(q => (
                    <div key={q.id} style={{ fontSize: "13px", marginBottom: "8px", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      <span style={{ color: "var(--text-secondary)" }}>{q.text}</span>
                    </div>
                 ))}
                 {questionsCount > 5 && <div className="muted" style={{ fontSize: "12px", marginTop: "8px" }}>...and {questionsCount - 5} more elements locked in payload.</div>}
               </div>
            )}
            {!loading && questionsCount === 0 && (
               <div style={{ marginTop: "24px", padding: "12px", background: "rgba(248, 113, 113, 0.1)", border: "1px dashed rgba(248, 113, 113, 0.4)", color: "#f87171" }}>
                 NO DATA MATCHING CURRENT FILTERS. TRANSMISSION ABORTED.
               </div>
            )}
          </div>
          
          <div className="row" style={{ justifyContent: "space-between", alignItems: "center", marginTop: "var(--spacing-lg)" }}>
            <span style={{ color: status.includes("ERR") ? "#f87171" : "var(--accent-cyan)" }}>{status}</span>
            <button className="btn btn-primary" onClick={handleSend} disabled={sending || selectedCandidates.size === 0 || questionsCount === 0}>
               {sending ? "[ TRANSMITTING ]" : "[ EXECUTE SEND ]"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
