import { useCallback, useEffect, useRef, useState } from "react";

/**
 * useRecorder — mikrafon o'lchash:
 *  - bro Star SpeechRecognition (lang tr-TR) ovozni matngan
 *  - MediaRecorder + AudioContext analyser → jonli to'lqin (waveform)
 * stop() yakuniy transkriptni qaytarge (Promise).
 */
export function useRecorder(lang = "tr-TR") {
  const SR =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const recRef = useRef(null);
  const mediaRef = useRef(null);
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);
  const finalRef = useRef("");
  const timerRef = useRef(null);
  const stopResolver = useRef(null);

  const [supported, setSupported] = useState(Boolean(SR));
  const [recording, setRecording] = useState(false);
  const [interim, setInterim] = useState("");
  const [seconds, setSeconds] = useState(0);

  useEffect(() => setSupported(Boolean(SR)), [SR]);

  const tick = useCallback(() => setSeconds((s) => s + 1), []);

  const start = useCallback(async () => {
    finalRef.current = "";
    setInterim("");
    setSeconds(0);
    setRecording(true);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaRef.current = stream;
      const ctx = new (window.AudioContext || window.webkitAudioContext)();
      ctxRef.current = ctx;
      const src = ctx.createMediaStreamSource(stream);
      const analyser = ctx.createAnalyser();
      analyser.fftSize = 1024;
      src.connect(analyser);
      analyserRef.current = analyser;
    } catch (e) {
      // Mikrofon ruxsati berilmasa ham matn kiritish mumkin: bu yerda ovoz yo'q
      analyserRef.current = null;
    }

    if (SR) {
      try {
        const rec = new SR();
        rec.lang = lang;
        rec.continuous = true;
        rec.interimResults = true;
        rec.onresult = (ev) => {
          let it = "";
          for (let i = ev.resultIndex; i < ev.results.length; i++) {
            const txt = ev.results[i][0].transcript;
            if (ev.results[i].isFinal) finalRef.current += " " + txt.trim();
            else it += txt;
          }
          setInterim(it.trim());
        };
        rec.onerror = () => {};
        rec.onend = () => {
          // Chrome ba'zilari ses kesilganida o'z-o'zidan yopilir: davom etishni didirish
          if (recordingRef.current && stopResolver.current === null) {
            try { rec.start(); } catch {}
          }
        };
        rec.start();
        recRef.current = rec;
      } catch {
        recRef.current = null;
      }
    }

    timerRef.current = setInterval(tick, 1000);
  }, [SR, lang, tick]);

  const recordingRef = useRef(false);
  useEffect(() => {
    recordingRef.current = recording;
  }, [recording]);

  const stop = useCallback(() => {
    return new Promise((resolve) => {
      stopResolver.current = resolve;
      setRecording(false);
      clearInterval(timerRef.current);
      if (recRef.current) {
        try { recRef.current.stop(); } catch {}
        recRef.current = null;
      }
      setTimeout(() => {
        if (stopResolver.current) {
          const r = stopResolver.current;
          stopResolver.current = null;
          r(finalRef.current.trim());
        }
      }, 350);
    });
  }, []);

  const cleanup = useCallback(() => {
    clearInterval(timerRef.current);
    if (recRef.current) { try { recRef.current.stop(); } catch {} recRef.current = null; }
    if (mediaRef.current) {
      mediaRef.current.getTracks().forEach((t) => t.stop());
      mediaRef.current = null;
    }
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
      analyserRef.current = null;
    }
  }, []);

  useEffect(() => cleanup, [cleanup]);

  return {
    supported,
    recording,
    interim,
    seconds,
    getAnalyser: () => analyserRef.current,
    getFinalText: () => finalRef.current.trim(),
    start,
    stop,
    cleanup,
  };
}
