import Icon from "./Icons";

export default function CallDock({ muted, onToggleMute, onEnd, showTranslation, onToggleTranslation }) {
  return (
    <div className="dock flex items-start justify-center gap-8 px-4 pb-[max(18px,env(safe-area-inset-bottom))] pt-3">
      <button
        type="button"
        onClick={onToggleMute}
        className={`dock-btn ${muted ? "dock-btn-muted" : ""}`}
        aria-label={muted ? "Mikrofonni yoqish" : "Mikrofonni o'chirish"}
        aria-pressed={muted}
      >
        <span className="dock-btn-icon">
          <Icon name={muted ? "micOff" : "mic"} size={21} />
        </span>
        <span>Mikrofon</span>
      </button>

      <button type="button" onClick={onEnd} className="dock-end" aria-label="Qo'ng'iroqni tugatish">
        <Icon name="phoneOff" size={22} strokeWidth={1.8} />
        <span className="sr-only">Tugatish</span>
      </button>

      <button
        type="button"
        onClick={onToggleTranslation}
        className={`dock-btn ${showTranslation ? "dock-btn-active" : ""}`}
        aria-label="Tarjima va maslahatlar"
        aria-pressed={showTranslation}
      >
        <span className="dock-btn-icon">
          <Icon name="languages" size={21} />
        </span>
        <span>Tarjima</span>
      </button>
    </div>
  );
}
