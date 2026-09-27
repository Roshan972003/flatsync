"use client";

import { RoommateEvaluation } from "@/lib/types";

function polarToCartesian(cx: number, cy: number, radius: number, angleDeg: number) {
  const angleRad = ((angleDeg - 90) * Math.PI) / 180;
  return { x: cx + radius * Math.cos(angleRad), y: cy + radius * Math.sin(angleRad) };
}

const RING_LEVELS = [0.25, 0.5, 0.75, 1];

/**
 * Small radar/spider chart plotting each roommate's satisfaction % for one
 * listing on its own axis, so the group can see at a glance whether a
 * listing is evenly good for everyone or lopsided toward one person.
 */
export function RadarScore({
  roommateEvaluations,
}: {
  roommateEvaluations: RoommateEvaluation[];
}) {
  const n = roommateEvaluations.length;
  if (n === 0) return null;

  const cx = 70;
  const cy = 66;
  const maxR = 42;
  const angleStep = 360 / n;

  const points = roommateEvaluations.map((re, i) =>
    polarToCartesian(cx, cy, (re.scorePercent / 100) * maxR, i * angleStep)
  );
  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  return (
    <svg
      viewBox="0 0 140 140"
      className="h-28 w-28 shrink-0"
      role="img"
      aria-label={roommateEvaluations
        .map((re) => `${re.roommateName} ${re.scorePercent}%`)
        .join(", ")}
    >
      {RING_LEVELS.map((level) => (
        <polygon
          key={level}
          points={roommateEvaluations
            .map((_, i) => {
              const p = polarToCartesian(cx, cy, maxR * level, i * angleStep);
              return `${p.x},${p.y}`;
            })
            .join(" ")}
          fill="none"
          stroke="hsl(var(--border))"
          strokeWidth={0.75}
        />
      ))}

      {roommateEvaluations.map((_, i) => {
        const p = polarToCartesian(cx, cy, maxR, i * angleStep);
        return (
          <line
            key={i}
            x1={cx}
            y1={cy}
            x2={p.x}
            y2={p.y}
            stroke="hsl(var(--border))"
            strokeWidth={0.75}
          />
        );
      })}

      <polygon
        points={polygonPoints}
        fill="hsl(262 68% 52% / 0.22)"
        stroke="hsl(var(--primary))"
        strokeWidth={1.75}
        strokeLinejoin="round"
      />

      {points.map((p, i) => (
        <circle key={i} cx={p.x} cy={p.y} r={2.25} fill="hsl(var(--primary))" />
      ))}

      {roommateEvaluations.map((re, i) => {
        const labelPos = polarToCartesian(cx, cy, maxR + 16, i * angleStep);
        return (
          <text
            key={re.roommateId}
            x={labelPos.x}
            y={labelPos.y}
            textAnchor="middle"
            dominantBaseline="middle"
            fill="hsl(var(--muted-foreground))"
            fontSize={9}
            fontWeight={600}
          >
            {re.roommateName}
          </text>
        );
      })}
    </svg>
  );
}
