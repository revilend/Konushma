export default function Captions({ text = "", placeholder = "", speaking = false, className = "" }) {
  const words = String(text || "").split(/\s+/).filter(Boolean);
  return (
    <div className={`min-h-[58px] px-2 text-center ${className}`}>
      {words.length ? (
        speaking ? (
          <p
            key={text}
            className="caption-line text-balance text-[17px] font-medium leading-relaxed text-white/90 sm:text-xl"
          >
            {words.map((word, i) => (
              <span
                key={`${i}-${word}`}
                className="caption-word"
                style={{ animationDelay: `${Math.min(i * 38, 520)}ms` }}
              >
                {word}{" "}
              </span>
            ))}
          </p>
        ) : (
          <p className="text-balance text-[15px] font-medium leading-relaxed text-white/55">{text}</p>
        )
      ) : (
        <p className="pt-3 text-[13px] tracking-wide text-white/30">{placeholder}</p>
      )}
    </div>
  );
}
