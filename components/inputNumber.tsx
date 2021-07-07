import { ReactNode, ReactNodeArray } from "react";
import NumberFormat, { NumberFormatProps } from "react-number-format";

export default function InputNumber({
  inputText = "$BEPRO",
  placeholder = "0",
  ...params
}: NumberFormatProps) {
  return (
    <div className="input-group">
      <NumberFormat {...params} placeholder={placeholder} />
      <span className="input-group-text text-white-50 p-small">{inputText}</span>
    </div>
  );
}
