import ArrowDown from '@assets/icons/arrow-down'

export default function NetworkListBar({
  hideOrder = false
}) {
  return (
    <div className="row py-0 mx-0 mb-2 svg-with-text-color">
      <div className="col-3 d-flex flex-row justify-content-center align-items-center text-primary">
        <span className="caption-medium mr-1">Network Name</span>
        { !hideOrder && <ArrowDown width={9.33} height={6.22} /> || <></>}
      </div>

      <div className="col-3 d-flex flex-row justify-content-center align-items-center text-ligth-gray">
        <span className="caption-medium mr-1">
          Number of bounties
        </span>
        { !hideOrder && <ArrowDown width={9.33} height={6.22} /> || <></>}
      </div>

      <div className="col-3 d-flex flex-row justify-content-center align-items-center text-ligth-gray">
        <span className="caption-medium mr-1">$BEPRO Locked</span>
        { !hideOrder && <ArrowDown width={9.33} height={6.22} /> || <></>}
      </div>

      <div className="col-3 d-flex flex-row justify-content-end align-items-center text-ligth-gray">
        <span className="caption-medium mr-1">Open bounties</span>
        { !hideOrder && <ArrowDown width={9.33} height={6.22} /> || <></>}
        <div className="mr-2"></div>
      </div>
    </div>
  )
}
