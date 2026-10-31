let seq = 0;
const listeners = new Set();

export function toast(message, tone = "neutral") {
  if (!message) return;
  const item = { id: ++seq, message: String(message), tone };
  listeners.forEach((listener) => listener(item));
}

export function subscribeToasts(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
