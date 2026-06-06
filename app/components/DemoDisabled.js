"use client";
import { useState } from "react";

// Inlined at build time by Next.js — safe to use at module level.
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === "true";

/**
 * Wraps any button in a non-interactive shell with a styled
 * "Demo mode — disabled" tooltip on hover.
 * When DEMO_MODE is false this component is a transparent pass-through.
 */
export function DemoDisabled({ children }) {
  const [hovered, setHovered] = useState(false);
  if (!DEMO_MODE) return children;
  return (
    <div
      style={{ position: "relative", display: "inline-flex", cursor: "not-allowed" }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={{ pointerEvents: "none", opacity: 0.4 }}>{children}</div>
      {hovered && (
        <div
          style={{
            position: "absolute",
            bottom: "calc(100% + 6px)",
            left: "50%",
            transform: "translateX(-50%)",
            background: "var(--surface)",
            border: "1px solid var(--border2)",
            borderRadius: 6,
            padding: "5px 10px",
            fontSize: 11,
            color: "var(--muted)",
            whiteSpace: "nowrap",
            zIndex: 9999,
            boxShadow: "0 4px 12px rgba(0,0,0,0.3)",
            pointerEvents: "none",
          }}
        >
          Demo mode — disabled
        </div>
      )}
    </div>
  );
}
