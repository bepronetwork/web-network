import { ChangeEvent, useState } from "react";
import { Form } from "react-bootstrap";

export default function NewProposalDistributionItem({
  by = "",
  onChange = () => {},
  InputProps = {},
  ...props
}: {
  by: string;
  onChange: (params: Object) => void;
  InputProps?: Object;
}) {
  const [state, setState] = useState<string>("0");

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    const value = event.target.value;

    setState(value);
    onChange({ [by]: value || "0" });
  }

  return (
    <li className="row list-item rounded" {...props}>
      <span>{by}</span>
      <div>
        <Form.Control
          type="number"
          placeholder="Amount"
          value={state}
          min={0}
          onChange={handleChange}
          {...InputProps}
        />
      </div>
    </li>
  );
}
