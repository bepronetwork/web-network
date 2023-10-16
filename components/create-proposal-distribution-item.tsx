import { useState } from "react";
import { NumberFormatValues } from "react-number-format";

import Avatar from "components/avatar";
import InputNumber from "components/input-number";

interface Props {
  githubLogin: string;
  onChangeDistribution(params: { [key: string]: number }): void;
  isDisable?: boolean;
  error?: boolean;
  success?: boolean;
  warning?: boolean;
}

export default function CreateProposalDistributionItem({
  githubLogin,
  onChangeDistribution,
  isDisable = false,
  ...params
}: Props) {
  const [value, setValue] = useState<number>();

  function handleValueChange(params: NumberFormatValues) {
    setValue(params.floatValue);
    onChangeDistribution({ [githubLogin]: params.floatValue || 0 });
  }
  // Wasted logic.
  // todo: move within InputNumber itself.
  function handleBlur() {
    let enhancedValue = value;
    if (value > 100) {
      enhancedValue = 100;
    }
    if (!value || value < 0) {
      enhancedValue = undefined;
    }

    setValue(enhancedValue);
    onChangeDistribution({ [githubLogin]: enhancedValue || 0 });
  }

  return (
    <li className="d-flex align-items-center px-3 py-1 my-1 rounded-3 bg-dark-gray" key={githubLogin}>
      {githubLogin && (
        <Avatar userLogin={githubLogin} className="me-2 mt-1" />
      )}
      <span className="flex-grow-1 caption-small">@{githubLogin}</span>
      <div className="flex-shrink-0 w-20">
        <InputNumber
          value={value}
          suffix="%"
          onValueChange={handleValueChange}
          onBlur={handleBlur}
          className="text-center"
          disabled={isDisable}
          placeholder="0%"
          {...params}
        />
      </div>
    </li>
  );
}
