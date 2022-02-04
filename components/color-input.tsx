import { useState } from 'react'

export default function ColorInput({ label, value, onChange, error = false }) {
  const [color, setColor] = useState(value)

  function handleBlur(event) {
    if (event.target.value === '#000000') {
      event.preventDefault()
      event.stopPropagation()
    }
    else onChange({ label, value: color })
  }

  function handleChange(event) {
    setColor(event.target.value.toUpperCase())
  }

  return (
    <div className="d-flex text-center flex-column align-items-center">
      <div className={`custom-color-input ${error && 'is-invalid' || ''}`}>
        <input
          type="color"
          name={label}
          id={label}
          value={color}
          onChange={handleChange}
          onBlur={handleBlur}
        />
      </div>

      <span className={`caption-medium text-${error && 'danger' || 'white'} mt-2`}>{label}</span>
      <span className={`caption-small text-${error && 'danger' || 'ligth-gray'} mt-2`}>{value}</span>
    </div>
  )
}
