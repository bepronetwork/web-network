export default function PercentageProgressBar({
  value = 0,
  pgClass = "",
  textClass = "",
  className = ""
}) {

  return (
    <div
      className={`${className}`}
      style={{ width: `${value}%`, minWidth: "1%" }}
    >
      <div className={textClass}>{value}%</div>
      <div className={`progress ${pgClass} w-100`}>
        <div
          className={`progress-bar ${pgClass} w-100`}
          role="progressbar"
        ></div>
      </div>
    </div>
  );
}
