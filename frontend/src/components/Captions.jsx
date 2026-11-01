import ClickableText from "./ClickableText";

export default function Captions({
  text = "",
  placeholder = "",
  speaking = false,
  className = "",
  vocab,
  playTTS,
}) {
  return (
    <div className={`flex min-h-[64px] items-center justify-center px-2 text-center ${className}`}>
      {text ? (
        <p className="max-w-xl text-balance text-[18px] font-normal leading-relaxed tracking-[-0.01em] text-zinc-100 sm:text-[21px]">
          <ClickableText text={text} vocab={vocab} playTTS={playTTS} />
        </p>
      ) : (
        <p className="text-[13px] tracking-wide text-zinc-500">{placeholder}</p>
      )}
    </div>
  );
}
