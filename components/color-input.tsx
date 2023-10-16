import {  useRef, useState } from "react";

export default function ColorInput({ label, code, onChange, onlyColorCode = false, error = false }) {
  const [color, setColor] = useState(code);
  const inputRef = useRef<HTMLInputElement>(null);
  const debounce = useRef(null)

  function handleBlur(event) {
    if (event.target.value === "#000000") {
      event.preventDefault();
      event.stopPropagation();
    } else onChange(onlyColorCode ? color : { label, code: event.target.value.toUpperCase() });
  }

  function handleChange(event) {
    const newColor = event.target.value.toUpperCase();
    setColor(newColor);

    // Clear the previous timeout, if it exists
    if (debounce.current) {
      clearTimeout(debounce.current);
    }
    
    debounce.current = setTimeout(() => {
      onChange(onlyColorCode ? newColor : { label, code: event.target.value.toUpperCase() });
    }, 500)
  }

  function focusInput(){
    if(inputRef?.current) inputRef?.current?.click();
  }

  return (
    <div className="d-flex flex-column mb-2">
      <span
        className={`caption-small font-weight-medium text-${(error && "danger") || "gray-100"} mt-2 mb-1`}
      >
        {label}
      </span>

      <div className={`d-flex flex-row align-items-center bg-gray-900 border-radius-4 
        custom-color-input-wrapper cursor-pointer`} onClick={focusInput}>
        <div className={`custom-color-input mr-1 ${(error && "is-invalid") || ""}`}>
          <input
            type="color"
            name={label}
            id={label}
            value={color}
            onChange={handleChange}
            onBlur={handleBlur}
            ref={inputRef}
            className={'cursor-pointer'}
          />
        </div>

        <span className={`caption-small text-${ (error && "danger") || "white" }`} >
          {code}
        </span>
      </div>
    </div>
  );
}
