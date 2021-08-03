export default function TransferOraclesButton({buttonLabel = `get oracles`, onClick, disabled}) {
  return (
    <button className="btn btn-md btn-lg btn-primary w-100 mb-3 text-uppercase"
            disabled={disabled}
            onClick={onClick}>
      {buttonLabel}
    </button>
  )
}
