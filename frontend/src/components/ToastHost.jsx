import { useEffect, useState } from "react";
import { subscribeToasts } from "../lib/toast";
import Icon from "./Icons";

export default function ToastHost({ elevated = false }) {
  const [items, setItems] = useState([]);

  useEffect(() => {
    return subscribeToasts((item) => {
      setItems((prev) => [...prev.slice(-2), item]);
      window.setTimeout(() => {
        setItems((prev) => prev.filter((entry) => entry.id !== item.id));
      }, 4200);
    });
  }, []);

  if (!items.length) return null;

  return (
    <div
      className={`pointer-events-none fixed inset-x-0 z-[120] flex flex-col items-center gap-2 px-4 ${
        elevated ? "bottom-28" : "bottom-6"
      }`}
    >
      {items.map((item) => (
        <div
          key={item.id}
          className="toast-in pointer-events-auto flex max-w-sm items-start gap-2.5 rounded-xl border border-white/10 bg-[#18181b]/95 px-3.5 py-2.5 text-[13px] leading-snug text-zinc-200 shadow-[0_20px_60px_-15px_rgba(0,0,0,.8)] backdrop-blur-xl"
        >
          <Icon
            name={item.tone === "error" ? "alert" : item.tone === "success" ? "checkCircle" : "info"}
            size={15}
            className="mt-0.5 shrink-0 text-zinc-400"
          />
          <span>{item.message}</span>
        </div>
      ))}
    </div>
  );
}
