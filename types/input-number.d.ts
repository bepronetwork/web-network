import { ReactElement } from "react";
import { NumberFormatProps } from "react-number-format";

export interface InputNumber extends NumberFormatProps {
  label?: string;
  symbol?: string;
  helperText?: string | ReactElement;
  error?: boolean;
  success?: boolean;
  warning?: boolean;
  onValueChange?: (values: NumberFormatValues) => void;
  value?: number | string | null;
  suffix?: string;
  classSymbol?: string;
  placeholder?: string;
  onBlur?: () => void;
  className?: string;
  min?: string | number;
  htmlFor?: string;
  disabled?: boolean;
  max?: string | number;
  thousandSeparator?: boolean | string;
  decimalSeparator?: string;
  decimalScale?: number;
  setMaxValue?: () => void;
  errorMessage?: string;
}
