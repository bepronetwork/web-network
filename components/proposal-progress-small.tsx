import {formatNumberToNScale} from '@helpers/formatNumber';

interface Options {
  pgClass: string;
  value: number;
  total: number;
  textClass: string;
}

export default function ProposalProgressSmall({pgClass = ``, value, total, textClass}: Options) {
  const dotStyle = {width: `10px`, height: `10px`};
  
  function toPercent(current = 0, max = 0, decimals = 2) {
    return ((current / max) * 100).toFixed(decimals);
  }

  return <div className="text-center position-relative d-inline-block">
    <div className={`smallCaption`}>
      <span className={textClass}>{formatNumberToNScale(value)}</span>
      <span>/{formatNumberToNScale(total)} oracles</span>
    </div>
    <div className={`progress ${pgClass}`}>
      <div className={`progress-bar`}
           role="progressbar"
           style={{width: `${toPercent(value, total)}%`}}>
        <div style={{...dotStyle, left: 0}} className={`rounded-circle position-absolute ${+toPercent(value, total) > 10 ? pgClass : `empty-dot`}`}/>
        <div style={{...dotStyle, right: `10%`}} className={`rounded-circle position-absolute ${+toPercent(value, total) > 90 ? pgClass : `empty-dot`}`}/>
      </div>
    </div>
    <div className={`smallCaption ${textClass}`}>{toPercent(value, total)}%</div>
  </div>
}
