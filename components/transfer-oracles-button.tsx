import LockIcon from "@assets/icons/lock"
export default function TransferOraclesButton({buttonLabel = `get oracles`, action, onClick, disabled}) {
  return (
    <button className={`btn btn-md btn-lg btn-${action === 'Lock' ? 'purple' : 'primary' } ${disabled && `bg-disabled border-0`} w-100 mb-3 text-uppercase fs-small`}
            disabled={disabled}
            onClick={onClick}>
        {disabled && <LockIcon width={12} height={14} className="mr-1"/>}
        {buttonLabel}
    </button>
  )
}
