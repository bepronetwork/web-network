import { ChangeEvent } from "react";
import { Form } from "react-bootstrap";

interface SwitchProps {
  label?: string;
  value: boolean;
  disabled?: boolean;
  onChange: (newValue: boolean) => void;
}

export default function Switch({
  label,
  value,
  disabled,
  onChange
}: SwitchProps) {

  function handleChange(e: ChangeEvent<HTMLInputElement>) {
    onChange(!!e.target.checked);
  }

  return(
    <Form.Check
      type="switch"
      label={label}
      checked={value}
      onChange={handleChange}
      disabled={disabled}
    />
  );
}