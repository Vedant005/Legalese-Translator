"use client";
import { useRef, useState } from "react";

export default function SpotlightCard({
  children,
  className = "",
  active = false,
}: {
  children: React.ReactNode;
  className?: string;
  active?: boolean;
}) {
  const divRef = useRef<HTMLDivElement>(null);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!divRef.current) return;
    const rect = divRef.current.getBoundingClientRect();
    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onMouseEnter={() => setOpacity(1)}
      onMouseLeave={() => setOpacity(0)}
      className={`
        relative overflow-hidden rounded-2xl 
        border border-white/[0.06] 
        bg-gradient-to-b from-white/[0.06] to-white/[0.01] 
        shadow-[0_0_0_1px_rgba(255,255,255,0.06),0_2px_20px_rgba(0,0,0,0.4),0_0_40px_rgba(0,0,0,0.2)] 
        transition-all duration-300 ease-[cubic-bezier(0.16,1,0.3,1)]
        hover:-translate-y-1
        hover:shadow-[0_0_0_1px_rgba(255,255,255,0.1),0_8px_40px_rgba(0,0,0,0.5),0_0_80px_rgba(94,106,210,0.1)]
        ${active ? "ring-1 ring-[#5E6AD2]/50" : ""}
        ${className}
      `}
    >
      <div
        className="pointer-events-none absolute -inset-px transition-opacity duration-300"
        style={{
          opacity,
          background: `radial-gradient(300px circle at ${position.x}px ${position.y}px, rgba(94,106,210,0.15), transparent 40%)`,
        }}
      />
      <div className="absolute inset-x-0 top-0 h-[1px] bg-gradient-to-r from-transparent via-white/15 to-transparent shadow-[inset_0_1px_0_0_rgba(255,255,255,0.1)]" />

      <div className="relative z-10 h-full">{children}</div>
    </div>
  );
}
