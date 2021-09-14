import {useEffect, useState} from 'react';

export default function StepProgressBar({stakedAmount = 0, isDisputed = null, issueAmount = 0}) {
  const [issueState, setIssueState] = useState<string>(``);
  const [issueColor, setIssueColor] = useState<string>(``);
  const [percentage, setPercentage] = useState<number>(0);

  const columns = [0, increment(), increment()*2, increment()*3, increment()*3,]

  function toPercent(value = 0, total = 0, decimals = 2) {
    return ((value * 100) / total).toFixed(decimals);
  }

  function increment(oracles = issueAmount, totalOracles = stakedAmount, steps = 3) {
    return +(+toPercent(oracles, totalOracles) / steps).toFixed(2);
  }

  console.log(stakedAmount, isDisputed, issueAmount)

  function getStateColor() {
    if (isDisputed)
      return `purple`

    if (isDisputed === false)
      return `red`;

    if (!isDisputed)
      return `white-50`;

    return `success`
  }

  function getStateText() {
    if (isDisputed === true)
      return `Open for dispute`

    if (isDisputed === false)
      return `Failed`;

    return `Waiting`;
  }

  function loadDisputeState() {
    setIssueState(getStateText());
    setIssueColor(getStateColor());
    setPercentage(+toPercent(issueAmount, stakedAmount));
  }

  function renderColumn(dotLabel, index) {
    const dotClass = `rounded-circle bg-${index * 20 < percentage ? `dark` : issueColor}`;
    const style = {left: `${index*20}%`, top: `-10%`};
    return <>
      <div className="position-absolute d-flex align-items-center flex-column" style={style}>
        <div className={dotClass}>
          <strong className="text-uppercase mt-3">{index+1 === columns.length ? `>` : ``}{dotLabel}%</strong>
        </div>
      </div>
    </>
  }

  useEffect(loadDisputeState, [stakedAmount, issueAmount, isDisputed]);

  return <>
    <div className="row mb-2">
      <div className="col d-flex justify-content-between">
        <h4 className={`text-capitalize text-${issueColor}`}>{issueState}</h4>
        <strong className={`fs-small text-${issueColor}`}>
          <span className={`text-${issueColor}`}>{issueAmount}</span> / {stakedAmount} ORACLES <span className={`text-${issueColor}`}>{percentage}%</span>
        </strong>
      </div>
    </div>
    <div className="row">
      <div className="col-12 position-relative">
        <div className="progress bg-dark">
          <div className={`progress-bar bg-${issueColor}`} role="progressbar" style={{width: `${percentage}%`}}>
            {columns.map(renderColumn)}
          </div>
        </div>
      </div>
    </div>
  </>
}
