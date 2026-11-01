import { useMemo, useState } from "react";
import WordLookup from "./WordLookup";

const TOKEN_RE = /([A-Za-zÇĞİÖŞÜçğıöşü]+(?:['’][A-Za-zÇĞİÖŞÜçğıöşü]+)?)/g;
const WORD_RE = /^[A-Za-zÇĞİÖŞÜçğıöşü]+(?:['’][A-Za-zÇĞİÖŞÜçğıöşü]+)?$/;

export default function ClickableText({
  text = "",
  context,
  vocab,
  playTTS,
  className = "",
  wordClassName = "",
}) {
  const [selected, setSelected] = useState(null);
  const parts = useMemo(() => String(text || "").split(TOKEN_RE), [text]);

  return (
    <span className={className}>
      {parts.map((part, index) => {
        if (!WORD_RE.test(part) || part.length < 2) {
          return <span key={index}>{part}</span>;
        }
        return (
          <button
            key={index}
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              setSelected(part);
            }}
            className={`word-tap ${wordClassName}`}
            title={`${part} — tarjimasini ko'rish`}
          >
            {part}
          </button>
        );
      })}
      {selected && (
        <WordLookup
          word={selected}
          context={context || text}
          vocab={vocab}
          playTTS={playTTS}
          onClose={() => setSelected(null)}
        />
      )}
    </span>
  );
}
