export default function ColorInput({ label, value, onChange }) {
  function handleChange(event) {
    onChange({label, value: event.target.value.toUpperCase()})
  }

  return (
    <div className="d-flex text-center flex-column align-items-center">
      <div className="custom-color-input">
        <input type="color" name={label} id={label} value={value} onChange={handleChange} />
      </div>

      <span className="caption-small text-white mt-2">{label}</span>
      <span className="small-info text-ligth-gray mt-2">{value}</span>
    </div>
  )
}
