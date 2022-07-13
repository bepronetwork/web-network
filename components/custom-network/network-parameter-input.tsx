import { NumberFormatValues } from "react-number-format";

import InputNumber from "components/input-number";

interface NetworkParameterInputProps {
  label: string;
  description?: string;
  symbol: string;
  value: number;
  onChange: (values: NumberFormatValues) => void;
  error?: boolean;
  onBlur?: () => void;
}

export default function NetworkParameterInput({
  onChange,
  ...props
} : NetworkParameterInputProps) {
  return(
    <div className="form-group col">
      <InputNumber
        classSymbol={"text-primary"}
        min={0}
        placeholder={"0"}
        thousandSeparator
        onValueChange={onChange}
        {...props}
      />
    </div>
  );
}