import { useState } from "react";
import { NumberFormatValues } from "react-number-format";

import Avatar from "components/avatar";
import InputNumber from "components/input-number";

interface Props {
  githubHandle: string;
  githubLogin: string;
  onChangeDistribution(params: { [key: string]: number }): void;
  defaultPercentage?: number;
  isDisable?: boolean;
  error?: boolean;
  success?: boolean;
  warning?: boolean;
}

export default function CreateProposalDistributionItem({
  githubHandle,
  githubLogin,
  onChangeDistribution,
  defaultPercentage = 0,
  isDisable = false,
  ...params
}: Props) {
  const [value, setValue] = useState<number>(defaultPercentage);

  function handleValueChange(params: NumberFormatValues) {
    setValue(params.floatValue);
    onChangeDistribution({ [githubHandle]: params.floatValue });
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
    onChangeDistribution({ [githubHandle]: enhancedValue });
  }

  return (
    <li className="d-flex align-items-center px-3 py-1 my-1 rounded-3 bg-dark-gray">
      {githubLogin && (
        <Avatar userLogin={githubLogin} className="me-2 mt-1" border />
      )}
      <span className="flex-grow-1 caption-small">@{githubHandle}</span>
      <div className="flex-shrink-0 w-20">
        <InputNumber
          value={value}
          suffix="%"
          onValueChange={handleValueChange}
          onBlur={handleBlur}
          className="text-center"
          disabled={isDisable}
          {...params}
        />
      </div>
    </li>
  );
}
