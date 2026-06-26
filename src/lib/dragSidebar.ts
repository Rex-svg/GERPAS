import { useEffect, useRef, useState } from "react";

export function useDragSidebar() {
  const ref = useRef<HTMLDivElement | null>(null);
  const [topOffset, setTopOffset] = useState(0);

  // keep last offset in DOM field so pointerdown can read it without re-subscribing on each setTopOffset
  useEffect(() => {
    const el = ref.current;
    if (el) (el as any).__bbSidebarTopOffset = topOffset;
  }, [topOffset]);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    let dragging = false;
    let startY = 0;
    let startOffset = 0;

    const onPointerDown = (e: PointerEvent) => {
      dragging = true;
      startY = e.clientY;
      // Use last-known offset without depending on it in hook deps
      startOffset = (el as any).__bbSidebarTopOffset ?? 0;
      try {
        (e.target as HTMLElement)?.setPointerCapture?.(e.pointerId);
      } catch {}
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!dragging) return;
      const dy = e.clientY - startY;
      setTopOffset(startOffset + dy);
    };

    const onPointerUp = () => {
      dragging = false;
    };

    el.addEventListener("pointerdown", onPointerDown);
    window.addEventListener("pointermove", onPointerMove);
    window.addEventListener("pointerup", onPointerUp);

    return () => {
      el.removeEventListener("pointerdown", onPointerDown);
      window.removeEventListener("pointermove", onPointerMove);
      window.removeEventListener("pointerup", onPointerUp);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [topOffset]);

  return { ref, topOffset };
}

