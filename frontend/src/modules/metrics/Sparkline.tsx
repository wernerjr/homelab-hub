export function Sparkline({
  points,
  height = 28,
  stroke = 'rgba(255,255,255,0.65)'
}: {
  points: number[];
  height?: number;
  stroke?: string;
}) {
  const w = 120;
  const h = height;

  if (points.length < 2) {
    return <div className="h-[28px] w-[120px] rounded bg-white/5" />;
  }

  const min = Math.min(...points);
  const max = Math.max(...points);
  const span = Math.max(1e-9, max - min);

  const d = points
    .map((p, i) => {
      const x = (i / (points.length - 1)) * w;
      const y = h - ((p - min) / span) * h;
      return `${x.toFixed(2)},${y.toFixed(2)}`;
    })
    .join(' ');

  return (
    <svg width={w} height={h} className="overflow-visible">
      <polyline
        fill="none"
        stroke={stroke}
        strokeWidth="2"
        strokeLinejoin="round"
        strokeLinecap="round"
        points={d}
      />
    </svg>
  );
}
