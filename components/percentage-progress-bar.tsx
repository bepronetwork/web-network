export default function PercentageProgressBar({value = 0, total = 0, pgClass = ``, textClass = ``}) {

  const percent = +((value * 100) / total).toFixed(2)

  return <div>
      <div className={textClass}>{percent}%</div>
      <div className={`progress ${pgClass}`}>
        <div className={`progress-bar`}
             role="progressbar"
             style={{width: `${percent}%`}}>
        </div>
      </div>
    </div>
}
