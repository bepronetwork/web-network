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
  error = "",
  ...params
}: InputNumber) {
  const id = kebabCase(label);
  const errorStyle = { "text-danger": error };

  return (
    <div className="form-group">
      <label className="p-small trans mb-2" id={id}>
        {label}
      </label>
      <div
        className={clsx("input-group", {
          ...errorStyle,
          "border border-1 border-danger rounded": error,
        })}>
        <NumberFormat
          className={clsx("form-control", { ...errorStyle }, className)}
          htmlFor={id}
          min={min}
          placeholder={placeholder}
          thousandSeparator={thousandSeparator}
          {...params}
        />
        {symbol && (
          <span
            className={clsx("input-group-text p-small", {
              "text-white-50": !error,
              ...errorStyle,
            })}>
            {symbol}
          </span>
        )}
      </div>
      {error && <p className="p-small text-danger my-2">{error}</p>}
      {helperText && <p className="p-small trans my-2">{helperText}</p>}
    </div>
  );
}
