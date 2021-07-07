import NumberFormat, { NumberFormatProps } from "react-number-format";

interface InputNumber extends NumberFormatProps {
  label?: string;
  symbol?: string;
  placeholder?: string;
}

export default function InputNumber({
  label = "",
  symbol = "$BEPRO",
  placeholder = "0",
  thousandSeparator = true,
  ...params
}: InputNumber) {
  return (
    <>
      {label && <label className="p-small mb-2">{label}</label>}
      <div className="input-group">
        <NumberFormat
          {...params}
          placeholder={placeholder}
          thousandSeparator={thousandSeparator}
        />
        <span className="input-group-text text-white-50 p-small">{symbol}</span>
      </div>
    </>
  );
}
