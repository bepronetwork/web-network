import { useState } from 'react'

export default function ColorInput({ label, value, onChange }) {
  const [color, setColor] = useState(value)

  function handleBlur(event) {
    onChange({ label, value: color })
  }

  function handleChange(event) {
    setColor(event.target.value.toUpperCase())
  }

  return (
    <div className="d-flex text-center flex-column align-items-center">
      <div className="custom-color-input">
        <input
          type="color"
          name={label}
          id={label}
          value={color}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </div>

      <span className="caption-small text-white mt-2">{label}</span>
      <span className="small-info text-ligth-gray mt-2">{value}</span>
    </div>
  )
}
