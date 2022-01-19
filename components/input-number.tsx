import clsx from "clsx";
import { kebabCase } from "lodash";
import { Fragment } from "react";
import NumberFormat from "react-number-format";
import { InputNumber as InputNumberProps } from "types/input-number";

export default function InputNumber({
  label = "",
  symbol = "",
  classSymbol = "text-primary",
  placeholder = "0",
  min = "0",
  helperText = "",
  className = "",
  error = false,
  success= false,
  warning= false,
  ...params
}: InputNumberProps): JSX.Element {
  const id = kebabCase(label);
  const errorStyle = { "text-danger bg-opacity-100": error };
  const successStyle = { "text-success bg-opacity-100": success };
  const warningStyle = { "text-warning bg-opacity-100": warning };
  const shouldBeWrapped = label || helperText;
  const Component = shouldBeWrapped ? "div" : Fragment;

  return (
    <Component {...(shouldBeWrapped && { className: "form-group" })}>
      {label && (
        <label className="caption-small mb-2 text-uppercase" id={id}>
          {label}
        </label>
      )}
      <div
        className={clsx("input-group", {
          ...errorStyle,
          ...successStyle,
          ...warningStyle,
        })}>
        <NumberFormat
          className={clsx("form-control", {
            "border border-1 border-success rounded-4": success,
            "border border-1 border-danger rounded-4": error,
            "border border-1 border-warning rounded-4": warning,  
            ...successStyle, 
            ...warningStyle,
            ...errorStyle,
          }, className)}
          htmlFor={id}
          min={min}
          placeholder={placeholder}
          {...params}
        />
        {symbol && (
          <span
            className={clsx("input-group-text caption-small text-uppercase", classSymbol, {
              ...errorStyle,
            })}>
            {symbol}
          </span>
        )}
      </div>
      {helperText && (
        <div
          className={clsx("p-small text-gray my-2", {
            trans: !error,
            className,
            ...errorStyle,
          })}>
          {helperText}
        </div>
      )}
      {error && (
        <p
        className={clsx("p-small text-gray my-2", {
          trans: !error,
          ...errorStyle,
        })}>
        {error}
      </p>
      )}
    </Component>
  );
}
