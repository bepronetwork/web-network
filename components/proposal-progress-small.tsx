import {formatNumberToNScale} from '@helpers/formatNumber';

interface Options {
  pgClass: string;
  value: number;
  total: number;
  textClass: string;
}

export default function ProposalProgressSmall({pgClass = ``, value, total, textClass}: Options) {
  const dotStyle = {width: `10px`, height: `10px`};

  const percent = ((((value * 100) / total) * 100) / 3).toFixed(2);

  return <div className="text-center position-relative d-inline-block">
    <div className={`smallCaption`}>
      <span className={textClass}>{formatNumberToNScale(value)}</span>
      <span>/{formatNumberToNScale(total)} oracles</span>
    </div>
    <div className={`progress ${pgClass}`}>
      <div className={`progress-bar`}
           role="progressbar"
           style={{width: `${percent}%`}}>
        <div style={{...dotStyle, left: 0}} className={`rounded-circle position-absolute ${+percent > 10 ? pgClass : `empty-dot`}`}/>
        <div style={{...dotStyle, right: `10%`}} className={`rounded-circle position-absolute ${+percent >= 100 ? pgClass : `empty-dot`}`}/>
      </div>
    </div>
    <div className={`smallCaption ${textClass}`}>{percent}%</div>
  </div>
}
