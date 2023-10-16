export default function ServiceFeesModalRow({
  label,
  percentage,
  amount,
  symbol,
  border = true,
}) {
  return (
    <div
      key={label}
      className={`d-flex py-3 flex-wrap justify-content-between ${
        border ? "border-bottom border-gray-700" : ""
      }`}
    >
      <span className="text-gray">
        {label} <span className="text-white">{percentage || "0"}%</span>
      </span>
      <span className="text-uppercase">
        {amount || 0} <span className="text-gray">{symbol || "token"}</span>
      </span>
    </div>
  );
}
