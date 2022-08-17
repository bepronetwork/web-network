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
}

export default function NetworkParameterInput({
  onChange,
  ...props
} : NetworkParameterInputProps) {
  const handleChange = (values: NumberFormatValues) => onChange(values.floatValue);

  return(
    <div className="form-group col mb-0">
      <InputNumber
        classSymbol={"text-primary"}
        min={0}
        placeholder={"0"}
        thousandSeparator
        onValueChange={handleChange}
        {...props}
      />
    </div>
  );
}