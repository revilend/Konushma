import { useCallback, useEffect, useRef, useState } from "react";

const SILENCE_MS = 1500;      // 1.5 soniya sukunat -> javob AI'ga yuboriladi
const RMS_THRESHOLD = 8;      // mikrofon shovqin chegarasi (0-255)

/**
 * useCall — jonli qo'ng'iroq dvigateli:
 *  - SpeechRecognition (tr-TR) uzluksiz tinglaydi
 *  - AnalyserNode RMS bilan gapirish aniqlanadi
 *  - gapirib bo'lib 1.5s jim tursa: mic yopilib, matn onTurn'ga yuboriladi
 *  - Aylin TTS ijro paytida mic to'liq o'chiriladi; bitgach yana ochiladi
 */
export function useCall({ onTurn, active }) {
  const SR =
    typeof window !== "undefined" &&
    (window.SpeechRecognition || window.webkitSpeechRecognition);

  const recRef = useRef(null);
  const streamRef = useRef(null);
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);
  const rafRef = useRef(0);
  const timerRef = useRef(null);

  const finalRef = useRef("");
  const interimRef = useRef("");
  const speakingNowRef = useRef(false);
  const lastVoiceTs = useRef(0);
  const busyRef = useRef(false);
  const inCallRef = useRef(false);
  const onTurnRef = useRef(onTurn);
  const turnDoneRef = useRef(() => {});
  const monitorRef = useRef(() => {});

  const [callState, setCallState] = useState("idle"); // idle | listening | thinking | speaking | muted
  const [interim, setInterim] = useState("");
  const [seconds, setSeconds] = useState(0);
  const [muted, setMuted] = useState(false);
  const mutedRef = useRef(false);

  useEffect(() => {
    onTurnRef.current = onTurn;
  }, [onTurn]);

  const openMic = useCallback(() => {
    if (!SR || !inCallRef.current || busyRef.current || mutedRef.current) return;
    finalRef.current = "";
    interimRef.current = "";
    setInterim("");
    try {
      const rec = new SR();
      rec.lang = "tr-TR";
      rec.continuous = true;
      rec.interimResults = true;
      rec.onresult = (ev) => {
        let it = "";
        for (let i = ev.resultIndex; i < ev.results.length; i++) {
          const txt = ev.results[i][0].transcript;
          if (ev.results[i].isFinal) finalRef.current += " " + txt.trim();
          else it += txt;
        }
        interimRef.current = it.trim();
        setInterim(it.trim());
      };
      rec.onerror = () => {};
      rec.onend = () => {
        // Chrome sessiyani o'z-o'zidan yopadi — qo'ng'iroq davom etsa qayta och
        if (inCallRef.current && !busyRef.current && !mutedRef.current) {
          setTimeout(() => {
            if (inCallRef.current && !busyRef.current && !mutedRef.current) {
              try {
                rec.start();
              } catch {}
            }
          }, 200);
        }
      };
      rec.start();
      recRef.current = rec;
      setCallState("listening");
    } catch {
      setCallState("listening");
    }
  }, [SR]);

  const turnDone = useCallback(() => {
    busyRef.current = true;
    if (rafRef.current) cancelAnimationFrame(rafRef.current);
    rafRef.current = 0;
    if (recRef.current) {
      try {
        recRef.current.onend = null;
        recRef.current.stop();
      } catch {}
      recRef.current = null;
    }
    const text = (finalRef.current || "").trim();
    finalRef.current = "";
    interimRef.current = "";
    setInterim("");
    if (!text) {
      busyRef.current = false;
      openMic();
      return;
    }
    setCallState("thinking");
    Promise.resolve(onTurnRef.current(text))
      .then(() => {
        busyRef.current = false;
        if (inCallRef.current) openMic();
      })
      .catch(() => {
        busyRef.current = false;
        if (inCallRef.current) openMic();
      });
  }, [openMic]);
  turnDoneRef.current = turnDone;

  const monitorLoop = useCallback(() => {
    const analyser = analyserRef.current;
    if (!inCallRef.current || !analyser || mutedRef.current) return;
    const data = new Uint8Array(analyser.frequencyBinCount);
    analyser.getByteFrequencyData(data);
    let sum = 0;
    for (let i = 0; i < data.length; i++) sum += data[i];
    const rms = sum / data.length;

    const now = Date.now();
    if (rms > RMS_THRESHOLD) {
      speakingNowRef.current = true;
      lastVoiceTs.current = now;
    }
    const heardSomething = finalRef.current.trim() || interimRef.current.trim();
    if (
      speakingNowRef.current &&
      now - lastVoiceTs.current > SILENCE_MS &&
      heardSomething &&
      !busyRef.current
    ) {
      speakingNowRef.current = false;
      turnDoneRef.current();
      return;
    }
    rafRef.current = requestAnimationFrame(monitorRef.current);
  }, []);
  monitorRef.current = monitorLoop;

  const start = useCallback(async () => {
    inCallRef.current = true;
    busyRef.current = false;
    mutedRef.current = false;
    setMuted(false);
    setSeconds(0);
    timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);

    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    ctxRef.current = ctx;
    const src = ctx.createMediaStreamSource(stream);
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 512;
    analyser.smoothingTimeConstant = 0.65;
    src.connect(analyser);
    analyserRef.current = analyser;

    rafRef.current = requestAnimationFrame(monitorRef.current);
    openMic();
  }, [openMic]);

  const aiSpeakingChanged = useCallback((flag) => {
    setCallState(flag ? "speaking" : mutedRef.current ? "muted" : "listening");
  }, []);

  const toggleMute = useCallback(() => {
    if (!inCallRef.current) return;
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    if (streamRef.current) {
      streamRef.current.getAudioTracks().forEach((track) => {
        track.enabled = !next;
      });
    }
    if (next) {
      if (rafRef.current) cancelAnimationFrame(rafRef.current);
      rafRef.current = 0;
      if (recRef.current) {
        try {
          recRef.current.onend = null;
          recRef.current.stop();
        } catch {}
        recRef.current = null;
      }
      finalRef.current = "";
      interimRef.current = "";
      setInterim("");
      setCallState("muted");
    } else {
      speakingNowRef.current = false;
      lastVoiceTs.current = 0;
      if (inCallRef.current && analyserRef.current) {
        rafRef.current = requestAnimationFrame(monitorRef.current);
      }
      setCallState("listening");
      openMic();
    }
  }, [openMic]);

  const end = useCallback(() => {
    inCallRef.current = false;
    busyRef.current = false;
    mutedRef.current = false;
    setMuted(false);
    clearInterval(timerRef.current);
    cancelAnimationFrame(rafRef.current);
    if (recRef.current) {
      try {
        recRef.current.onend = null;
        recRef.current.stop();
      } catch {}
      recRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    if (ctxRef.current) {
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
      analyserRef.current = null;
    }
    setCallState("idle");
    setInterim("");
  }, []);

  useEffect(() => end, [end]);

  return {
    callState,
    interim,
    seconds,
    muted,
    start,
    end,
    toggleMute,
    aiSpeakingChanged,
    getAnalyser: () => analyserRef.current,
  };
}
