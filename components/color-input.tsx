import { useEffect, useRef, useState } from "react";

export default function ColorInput({ label, code, onChange, error = false }) {
  const [color, setColor] = useState(code);
  const colorRef = useRef<HTMLInputElement>();

  function handleBlur(event) {
    if (event.target.value === "#000000") {
      event.preventDefault();
      event.stopPropagation();
    } else onChange({ label, code: color });
  }

  function handleChange(event) {
    setColor(event.target.value.toUpperCase());
  }

  function handleDivClick() {
    if (colorRef?.current) colorRef.current.click();
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (colorRef.current && !colorRef.current.contains(event.target)) {
        onChange({ label, code: color });
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [colorRef, color]);

  return (
    <div className="d-flex flex-column mb-2">
      <span
        className={`caption-small text-${(error && "danger") || "gray"} mt-2 mb-1`}
      >
        {label}
      </span>

      <div className={`d-flex flex-row align-items-center bg-black border-radius-8 
        custom-color-input-wrapper cursor-pointer`} onClick={handleDivClick}>
        <div className={`custom-color-input mr-1 ${(error && "is-invalid") || ""}`}>
          <input
            type="color"
            name={label}
            id={label}
            value={color}
            onChange={handleChange}
            onBlur={handleBlur}
            ref={colorRef}
          />
        </div>

        <span className={`caption-small text-${ (error && "danger") || "white" }`} >
          {code}
        </span>
      </div>
    </div>
  );
}
