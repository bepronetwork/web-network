import { ReactElement } from "react";
import { NumberFormatPropsBase } from "react-number-format";

export interface InputNumber extends NumberFormatPropsBase {
  label?: string;
  symbol?: string;
  helperText?: string | ReactElement;
  error?: boolean;
  success?: boolean;
  warning?: boolean;
}
