export default function ColorInput({ label, value }) {
  return (
    <div className="d-flex text-center flex-column align-items-center">
      <div className="custom-color-input">
        <input type="color" name="" id="" value={value} />
      </div>

      <span className="caption-small text-white mt-2">{label}</span>
      <span className="small-info text-ligth-gray mt-2">{value}</span>
    </div>
  )
}
