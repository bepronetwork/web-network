interface Options {
  pgClass: string;
  value: number;
  total: number;
  textClass: string;
}

export default function ProposalProgressSmall({pgClass = ``, value, total, textClass}: Options) {
  const dotStyle = {width: `10px`, height: `10px`};
  const percent = ((value * 100) / total).toFixed(2);
  return <div className="text-center position-relative d-inline-block">
    <div className={`smallCaption`}>
      <span className={textClass}>{value}</span>
      <span>/{total} oracles</span>
    </div>
    <div className={`progress ${pgClass}`}>
      <div className={`progress-bar`}
           role="progressbar"
           style={{width: `${percent}%`}}>
        <div style={{...dotStyle, left: 0}} className={`rounded-circle position-absolute ${+percent > 10 ? pgClass : `empty-dot`}`}/>
        <div style={{...dotStyle, right: `10%`}} className={`rounded-circle position-absolute ${+percent > 90 ? pgClass : `empty-dot`}`}/>
      </div>
    </div>
    <div className={`smallCaption ${textClass}`}>{percent}%</div>
  </div>
}
