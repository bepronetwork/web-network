export default function ApproveButton({disabled, onClick}) {

  return (
    <button className="btn btn-md btn-lg btn-opac w-100 mb-3 text-uppercase"
            disabled={disabled}
            onClick={onClick}>
      approve
    </button>
  )
}
