import { NumberFormatValues } from "react-number-format";

import InputNumber from "components/input-number";

interface NetworkParameterInputProps {
  label: string;
  description?: string;
  symbol: string;
  value: number;
  onChange: (value: number) => void;
  error?: boolean;
  onBlur?: () => void;
  decimals?: number;
  className?: string;
  disabled?: boolean;
}

export default function NetworkParameterInput({
  onChange,
  decimals = 18,
  className,
  disabled = false,
  ...props
} : NetworkParameterInputProps) {
  const handleChange = (values: NumberFormatValues) => onChange(values.floatValue);

  return(
    <div className={`form-group col mb-0 ${className}`}>
      <InputNumber
        classSymbol={"text-primary"}
        min={0}
        placeholder={"0"}
        thousandSeparator
        onValueChange={handleChange}
        decimalScale={decimals}
        disabled={disabled}
        {...props}
      />
    </div>
  );
}