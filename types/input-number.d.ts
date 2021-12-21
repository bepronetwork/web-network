import { ReactElement } from "react";
import { NumberFormat } from "react-number-format";

export interface InputNumber extends NumberFormatProps {
  label?: string;
  symbol?: string;
  helperText?: string | ReactElement;
  error?: boolean;
  success?: boolean;
  warning?: boolean;
  value?: number | string | null;
  suffix?: string;
  onValueChange?: (values: NumberFormatValues) => void;
  onBlur?: (values: Number) => void;
  className?: string;
}
