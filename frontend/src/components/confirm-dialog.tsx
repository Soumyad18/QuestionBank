interface ConfirmDialogProps {
  message: string;
  subMessage?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export function ConfirmDialog({ message, subMessage, onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <div style={{
      position: "fixed", inset: 0,
      background: "rgba(0,0,0,0.85)",
      display: "flex", alignItems: "center", justifyContent: "center",
      zIndex: 2000,
    }}>
      <div className="structural-grid" style={{ width: "100%", maxWidth: "420px" }}>
        <div className="grid-cell">
          <div className="row" style={{ marginBottom: "var(--spacing-sm)" }}>
            <span className="badge" style={{ color: "#f87171", borderColor: "#f87171" }}>
              CONFIRM_ACTION
            </span>
          </div>
          <p style={{ margin: "var(--spacing-md) 0 0", fontFamily: "var(--font-body)", fontSize: "15px", lineHeight: 1.6 }}>
            {message}
          </p>
          {subMessage && (
            <p className="muted" style={{ marginTop: "var(--spacing-sm)", fontSize: "12px" }}>
              {subMessage}
            </p>
          )}
        </div>
        <div className="grid-cell">
          <div className="row" style={{ justifyContent: "flex-end" }}>
            <button className="btn" onClick={onCancel}>
              [CANCEL]
            </button>
            <button className="btn btn-danger" onClick={onConfirm}>
              [CONFIRM // DELETE]
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
