export default function ApproveButton({disabled, onClick}) {

  return (
    <button className="btn btn-md btn-lg btn-primary w-100 mb-3 text-uppercase fs-small"
            disabled={disabled}
            onClick={onClick}>
      approve
    </button>
  )
}
