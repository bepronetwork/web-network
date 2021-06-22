import { sum } from "lodash";
import { ChangeEvent, useState } from "react";
import { Form } from "react-bootstrap";

export default function NewProposalDistributionItem({
  by = "",
  onChange = () => {},
  InputProps = { isInvalid: false },
  max = 0,
  ...params
}: {
  by: string;
  onChange: (params: Object) => void;
  InputProps?: { isInvalid: boolean };
  max: number;
}) {
  const [value, setValue] = useState<string>("0");

  function handleChange(event: ChangeEvent<HTMLInputElement>) {
    setValue(event.target.value);
  }
  function handleBlurChange(event: ChangeEvent<HTMLInputElement>) {
    let { value } = event.target;

    if (Number(value) > max) {
      value = `${max}`;
    }
    if (!value || Number.isNaN(value) || Number(value) < 0) {
      value = "0";
    }

    setValue(value);
    onChange({ [by]: value });
  }

  return (
    <li
      className="d-flex align-items-center new-proposal-distribution-item"
      {...params}>
      <span style={{ flex: 1 }}>{by}</span>
      <div>
        <Form.Control
          type="text"
          value={value}
          onChange={handleChange}
          onBlur={handleBlurChange}
          {...InputProps}
        />
      </div>
    </li>
  );
}
