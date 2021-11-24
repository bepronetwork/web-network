import clsx from "clsx";
import { kebabCase } from "lodash";
import { Fragment } from "react";
import NumberFormat from "react-number-format";
import { InputNumber as InputNumberProps } from "types/input-number";

export default function InputNumber({
  label = "",
  symbol = "",
  classSymbol = "text-blue",
  placeholder = "0",
  min = "0",
  helperText = "",
  className = "",
  error = "",
  ...params
}: InputNumberProps): JSX.Element {
  const id = kebabCase(label);
  const errorStyle = { "text-danger bg-opacity-100": error };
  const shouldBeWrapped = label || helperText;
  const Component = shouldBeWrapped ? "div" : Fragment;

  return (
    <Component {...(shouldBeWrapped && { className: "form-group" })}>
      {label && (
        <label className="smallCaption mb-2 text-uppercase" id={id}>
          {label}
        </label>
      )}
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
          decimalScale={0}
          {...params}
        />
        {symbol && (
          <span
            className={clsx("input-group-text smallCaption text-uppercase", classSymbol, {
              ...errorStyle,
            })}>
            {symbol}
          </span>
        )}
      </div>
      {helperText && (
        <div
          className={clsx("p-small my-2", {
            trans: !error,
            className,
            ...errorStyle,
          })}>
          {helperText}
        </div>
      )}
      {error && (
        <p
        className={clsx("p-small my-2", {
          trans: !error,
          ...errorStyle,
        })}>
        {error}
      </p>
      )}
    </Component>
  );
}
