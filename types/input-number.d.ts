import { ReactElement } from "react";
import { NumberFormatProps } from "react-number-format";

export interface InputNumber extends NumberFormatProps {
  label?: string;
  symbol?: string;
  helperText?: string | ReactElement;
  error?: boolean;
  success?: boolean;
  warning?: boolean;
  value?: number;
}
