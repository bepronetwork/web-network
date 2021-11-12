import {formatNumberToNScale} from '@helpers/formatNumber';

interface Options {
  pgClass: string;
  value: number;
  total: number;
  textClass: string;
}

export default function ProposalProgressSmall({pgClass = ``, value, total, textClass}: Options) {
  const dotStyle = {width: `10px`, height: `10px`};

  function toRepresentationPercent(value = 0, total = 5) {
    return (value * 100) / total;
  }

  const percent = ((value / total)* 100).toFixed(2);

  return <div className="text-center position-relative d-inline-block col">
    <div className={`smallCaption`}>
      <span className={textClass}>{formatNumberToNScale(value)}</span>
      <span>/{formatNumberToNScale(total)} oracles</span>
    </div>
    <div className={`progress bg-gray w-100`}>
      <div className={`wrapper wrapper-${pgClass} w-100`} />
      <div className={`progress-bar bg-${pgClass}`}
           role="progressbar"
           style={{width: `${toRepresentationPercent(+percent, 3)}%`}}>
        <div style={{...dotStyle, left: 0}} className={`rounded-circle position-absolute ${toRepresentationPercent(+percent, 3) > 0 ? `bg-${pgClass}` : `empty-dot`}`}/>
        <div style={{...dotStyle, right: `10%`}} className={`rounded-circle position-absolute ${+toRepresentationPercent(+percent, 3) >= 100 ? `bg-${pgClass}` : `empty-dot`}`}/>
      </div>
    </div>
    <div className={`smallCaption ${textClass}`}>{percent}%</div>
  </div>
}
