import { motion, useMotionValue, useTransform } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

export type Sticky = {
  id: string;
  title: string;
  hint?: string;
  color?: string;
  difficulty?: "again" | "hard" | "good" | "easy";
  x: number;
  y: number;
  rotate?: number;
};

const noteColors = ["var(--ww-note-yellow)", "var(--ww-note-pink)", "var(--ww-note-mint)", "var(--ww-note-sky)"];

function useZIndexManager(count: number) {
  const [layers, setLayers] = useState<number[]>(() => Array.from({ length: count }, (_, i) => i));
  function bringToFront(i: number) {
    setLayers((prev) => {
      const next = prev.slice();
      const idx = next.indexOf(i);
      if (idx >= 0) next.splice(idx, 1);
      next.push(i);
      return next;
    });
  }
  function z(i: number) {
    const idx = layers.indexOf(i);
    return 10 + idx;
  }
  return { bringToFront, z };
}

export function StickyWall({ width = "100%", height = "70vh" }: { width?: string | number; height?: string | number }) {
  const [notes, setNotes] = useState<Sticky[]>(() =>
    Array.from({ length: 8 }, (_, i) => ({
      id: `n${i}`,
      title: `Card ${i + 1}`,
      hint: "One-line hint",
      color: noteColors[i % noteColors.length],
      difficulty: ("again" as const),
      x: 40 + (i % 4) * 260,
      y: 30 + Math.floor(i / 4) * 190,
      rotate: Math.random() * 2 - 1,
    }))
  );

  const containerRef = useRef<HTMLDivElement>(null);
  const { z, bringToFront } = useZIndexManager(notes.length);

  function updatePosition(id: string, x: number, y: number) {
    setNotes((prev) => prev.map((n) => (n.id === id ? { ...n, x, y } : n)));
  }

  return (
    <div ref={containerRef} style={{ position: "relative", width, height, borderRadius: 12, background: "#f6f2ea", overflow: "hidden" }}>
      {notes.map((n, i) => (
        <StickyNote
          key={n.id}
          idx={i}
          z={z(i)}
          note={n}
          onFocus={() => bringToFront(i)}
          onMove={updatePosition}
        />
      ))}
    </div>
  );
}

function StickyNote({ note, onMove, onFocus, idx, z }: { note: Sticky; idx: number; z: number; onMove: (id: string, x: number, y: number) => void; onFocus: () => void }) {
  const x = useMotionValue(note.x);
  const y = useMotionValue(note.y);
  const rotate = useMotionValue(note.rotate || 0);
  const tilt = useTransform(x, (latest) => (latest - note.x) * 0.01);
  const r = useTransform([rotate, tilt], ([r0, t]) => (r0 as number) + (t as number));

  useEffect(() => {
    x.set(note.x);
    y.set(note.y);
  }, [note.x, note.y]);

  return (
    <motion.div
      className="sticky-card"
      style={{ x, y, rotate: r, background: note.color, zIndex: z }}
      drag
      dragMomentum
      onDragStart={onFocus}
      dragElastic={0.2}
      dragTransition={{ power: 0.15, timeConstant: 200, modifyTarget: (v) => v }}
      onDragEnd={(_, info) => {
        onMove(note.id, info.point.x - 100, info.point.y - 80);
      }}
      whileHover={{ scale: 1.02, y: -6 }}
      whileTap={{ scale: 0.99 }}
    >
      <div className={`sticky-dot ${note.difficulty || "good"}`} />
      <div className="title">{note.title}</div>
      <div className="hint">{note.hint}</div>
    </motion.div>
  );
}

export default StickyWall;

