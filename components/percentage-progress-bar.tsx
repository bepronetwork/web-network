export default function PercentageProgressBar({value = 0, total = 0, pgClass = ``, textClass = ``, className = ``}) {

  const percent = +((value * 100) / total).toFixed(2)

  return <div className={`flex-grow-1 ${className}`}>
      <div className={textClass}>{percent}%</div>
      <div className={`progress ${pgClass}`}>
        <div className={`progress-bar`}
             role="progressbar"
             style={{width: `${percent}%`}}>
        </div>
      </div>
    </div>
}
