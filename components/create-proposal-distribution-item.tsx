import InputNumber from "components/input-number";
import { useState } from "react";
import { NumberFormatValues } from "react-number-format";
import { InputNumber as InputNumberProps } from "types/input-number";

interface Props extends InputNumberProps {
  by: string;
  onChangeDistribution(params: { [key: string]: number }): void;
}

export default function CreateProposalDistributionItem({
  by = "",
  onChangeDistribution = (params = { key: 0 }) => {},
  ...params
}: Props) {
  const [value, setValue] = useState<number>(0);

  function handleValueChange(params: NumberFormatValues) {
    setValue(params.floatValue);
  }
  // Wasted logic.
  // todo: move within InputNumber itself.
  function handleBlur() {
    let enhancedValue = value;

    if (value > 100) {
      enhancedValue = 100;
    }
    if (!value || value < 0) {
      enhancedValue = 0;
    }

    setValue(enhancedValue);
    onChangeDistribution({ [by]: enhancedValue });
  }

  return (
    <li className="d-flex align-items-center px-3 py-1 my-1 rounded-3 btn-opac">
      <span className="flex-grow-1">{by}</span>
      <div className="flex-shrink-0 w-25">
        <InputNumber
          value={value}
          onValueChange={handleValueChange}
          onBlur={handleBlur}
          {...params}
        />
      </div>
    </li>
  );
}
