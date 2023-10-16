import { useEffect, useRef } from "react";
import { useState } from "react";
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
  helperText?: string;
  errorMessage?: string;
}

export default function NetworkParameterInput({
  onChange,
  decimals = 18,
  className,
  disabled = false,
  value,
  ...props
} : NetworkParameterInputProps) {
  const [inputValue, setInputValue] = useState<number | null>(null);

  const debounce = useRef(null);

  const handleChange = (values: NumberFormatValues) => {
    if(values.floatValue === inputValue) return;

    setInputValue(values.floatValue);
    
    clearTimeout(debounce.current);
    
    debounce.current = setTimeout(() => {
      onChange(values.floatValue);
    }, 500);
  };

  useEffect(() => {
    if(value !== inputValue) setInputValue(value);
  },[value]);
  
  return(
    <div className={`form-group col-12 col-md-6 col-xl-3 mb-0 ${className}`}>
      <InputNumber
        classSymbol={"text-primary"}
        min={0}
        placeholder={"0"}
        thousandSeparator
        value={inputValue}
        onValueChange={handleChange}
        disabled={disabled}
        decimalScale={decimals}
        {...props}
      />
    </div>
  );
}