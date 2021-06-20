import { ChangeEvent, useState } from "react";
import { Form } from "react-bootstrap";

export default function NewProposalDistributionItem({
  by = "",
  onChange = () => {},
  InputProps = {},
  maxValue = 0,
  ...props
}: {
  by: string;
  onChange: (params: Object) => void;
  InputProps?: Object;
  maxValue: number;
}) {
  const [state, setState] = useState<string>("0");

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setState(event.target.value);
  }
  function handleBlurChange(event: ChangeEvent<HTMLInputElement>) {
    let { value } = event.target;
    if (Number(value) > maxValue) {
      value = `${maxValue}`;
    }
    if (Number.isNaN(value) || Number(value) < 0) {
      value = "0";
    }

    setState(value);
    onChange({ [by]: value || "0" });
  }

  return (
    <li
      className="d-flex align-items-center new-proposal-distribution-item"
      {...props}>
      <span style={{ flex: 1 }}>{by}</span>
      <div className="d-flex align-items-center">
        <Form.Control
          type="number"
          value={state}
          onChange={handleChange}
          onBlur={handleBlurChange}
          {...InputProps}
        />
      </div>
    </li>
  );
}
