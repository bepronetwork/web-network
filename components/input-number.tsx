import clsx from "clsx";
import { kebabCase } from "lodash";
import { ReactElement } from "react";
import NumberFormat, { NumberFormatProps } from "react-number-format";

interface InputNumber extends NumberFormatProps {
  label: string;
  symbol?: string;
  helperText?: string | ReactElement;
  error?: string;
}

export default function InputNumber({
  label,
  symbol = "",
  placeholder = "0",
  thousandSeparator = true,
  min = "0",
  helperText = "",
  className = "",
  // todo: add error style too
  error = "",
  ...params
}: InputNumber) {
  const id = kebabCase(label);

  return (
    <div className="form-group mb-4">
      <label className="p-small trans mb-2" id={id}>
        {label}
      </label>
      <div className="input-group">
        <NumberFormat
          className={clsx("form-control", className)}
          htmlFor={id}
          min={min}
          placeholder={placeholder}
          thousandSeparator={thousandSeparator}
          {...params}
        />
        {symbol && (
          <span className="input-group-text text-white-50 p-small">
            {symbol}
          </span>
        )}
      </div>
      {error && <p className="p-small text-danger my-2">{error}</p>}
      {helperText && <p className="p-small trans my-2">{helperText}</p>}
    </div>
  );
}
