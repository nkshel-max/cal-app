type RingProps = {
  value: number;
  max: number;
};

export function Ring({ value, max }: RingProps) {
  const radius = 68;
  const circumference = 2 * Math.PI * radius;
  const ratio = max > 0 ? Math.min(value / max, 1) : 0;
  const over = max > 0 && value > max;

  return (
    <svg
      className={over ? "ring is-over" : "ring"}
      viewBox="0 0 160 160"
      role="img"
      aria-label={`${Math.round(value)} of ${Math.round(max)} kilocalories`}
    >
      <circle className="ring-track" cx="80" cy="80" r={radius} />
      <circle
        className="ring-value"
        cx="80"
        cy="80"
        r={radius}
        strokeDasharray={`${circumference * ratio} ${circumference}`}
        transform="rotate(-90 80 80)"
      />
    </svg>
  );
}
