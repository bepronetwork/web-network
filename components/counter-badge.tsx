export default function CounterBadge({ value = 0, className = "" }) {
  return (
    <span
      className={`counter-badge bg-primary text-center rounded-circle text-white ${className}`}
    >
      {value}
    </span>
  );
}
