// Shared React hooks for the deck: animation frame loop, managed timeouts, and pointer drag.
import { useEffect, useRef } from "react";

function useRAF(active, fn) {
  const cb = useRef(fn); cb.current = fn;
  useEffect(() => {
    if (!active) return;
    let raf, last = performance.now();
    const tick = (t) => {
      const dt = Math.min(64, t - last); last = t;
      cb.current(dt, t);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [active]);
}
function useTimeouts() {
  const ids = useRef([]);
  useEffect(() => () => { ids.current.forEach(clearTimeout); ids.current = []; }, []);
  return (fn, ms) => {
    const id = setTimeout(() => {
      ids.current = ids.current.filter((x) => x !== id);
      fn();
    }, ms);
    ids.current.push(id);
    return id;
  };
}
function usePointerDrag(ref, onMove, onUp) {
  useEffect(() => {
    const el = ref.current; if (!el) return;
    let dragging = false;
    const rectOf = () => el.getBoundingClientRect();
    const handle = (clientX, clientY) => {
      const r = rectOf();
      onMove({ x: clientX - r.left, y: clientY - r.top, w: r.width, h: r.height });
    };
    const down = (e) => {
      dragging = true; el.setPointerCapture?.(e.pointerId);
      handle(e.clientX, e.clientY);
    };
    const move = (e) => { if (dragging) handle(e.clientX, e.clientY); };
    const up = (e) => {
      if (!dragging) return;
      dragging = false; el.releasePointerCapture?.(e.pointerId);
      if (onUp) onUp();
    };
    el.addEventListener("pointerdown", down);
    el.addEventListener("pointermove", move);
    el.addEventListener("pointerup", up);
    el.addEventListener("pointercancel", up);
    el.addEventListener("pointerleave", up);
    return () => {
      el.removeEventListener("pointerdown", down);
      el.removeEventListener("pointermove", move);
      el.removeEventListener("pointerup", up);
      el.removeEventListener("pointercancel", up);
      el.removeEventListener("pointerleave", up);
    };
  }, [ref, onMove, onUp]);
}

export { useRAF, useTimeouts, usePointerDrag };
