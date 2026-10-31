function MicIcon({ off = false }) {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <rect x="9" y="3" width="6" height="11" rx="3" />
      <path d="M5 11a7 7 0 0 0 14 0" />
      <path d="M12 18v3" />
      {off && <path d="M4 4l16 16" className="text-rose-300" stroke="currentColor" />}
    </svg>
  );
}

function PhoneEndIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-7 w-7 rotate-[135deg]" fill="currentColor">
      <path d="M6.62 10.79a15.05 15.05 0 0 0 6.59 6.59l2.2-2.2a1 1 0 0 1 1.01-.24c1.12.37 2.33.57 3.58.57a1 1 0 0 1 1 1V20a1 1 0 0 1-1 1C10.61 21 3 13.39 3 4a1 1 0 0 1 1-1h3.5a1 1 0 0 1 1 1c0 1.25.2 2.46.57 3.58a1 1 0 0 1-.24 1.01l-2.21 2.2Z" />
    </svg>
  );
}

function GlobeIcon() {
  return (
    <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round">
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.5 2.6 3.8 5.8 3.8 9S14.5 18.4 12 21c-2.5-2.6-3.8-5.8-3.8-9S9.5 5.6 12 3Z" />
    </svg>
  );
}

export default function CallDock({
  muted,
  onToggleMute,
  onEnd,
  showTranslation,
  onToggleTranslation,
  disabled,
}) {
  return (
    <div className="flex items-start justify-center gap-7 rounded-[30px] border border-white/10 bg-white/[0.055] px-5 py-4 shadow-[0_20px_60px_-20px_rgba(0,0,0,.9)] backdrop-blur-2xl">
      <button
        type="button"
        onClick={onToggleMute}
        disabled={disabled}
        className={`dock-btn ${muted ? "dock-btn-off" : ""}`}
        aria-label={muted ? "Mikrofonni yoqish" : "Mikrofonni o‘chirish"}
      >
        <MicIcon off={muted} />
        <span>{muted ? "Mikrofon" : "Mikrofon"}</span>
      </button>

      <button
        type="button"
        onClick={onEnd}
        className="dock-end"
        aria-label="Qo‘ng‘iroqni tugatish"
      >
        <PhoneEndIcon />
      </button>

      <button
        type="button"
        onClick={onToggleTranslation}
        className={`dock-btn ${showTranslation ? "dock-btn-active" : ""}`}
        aria-label="Tarjima"
      >
        <GlobeIcon />
        <span>Tarjima</span>
      </button>
    </div>
  );
}
