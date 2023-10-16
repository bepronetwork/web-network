import { useEffect, useState } from "react";

import CheckButtonsView from "components/check-buttons/view";

import { SelectOption } from "types/utils";

interface CheckButtonsProps {
  checked?: string | number | string[] | number[];
  options: SelectOption[];
  multiple?: boolean;
  onClick?: (value: SelectOption | SelectOption[]) => void;
  disabled?: boolean;
}

interface SelectedOptions {
  [index: number]: boolean;
}

export default function CheckButtons({
  checked,
  options,
  multiple,
  onClick,
  disabled
}: CheckButtonsProps) {
  const [selected, setSelected] = useState<SelectedOptions>({});

  const isSelected = (opt, index) => !!selected[index];
  const toOptionWithSelected = (opt, index) => ({ ...opt, selected: isSelected(opt, index) });

  function handleClick(optionIndex) {
    return () => {
      setSelected(previous => {
        const toggled = { [optionIndex]: !multiple || !previous[optionIndex] };
        const newValue = multiple ? { ...previous, ...toggled } : toggled;
        const newOptions = options.filter((opt, index) => !!newValue[index]);
        onClick(multiple ? newOptions : newOptions.at(0));
        return newValue;
      });
    };
  }

  useEffect(() => {
    if (!checked) return;
    const tmpChecked = Array.isArray(checked) ? checked : [checked];
    const newSelected = tmpChecked.map(c => [options.findIndex(o => o.value === c), true]);
    setSelected(Object.fromEntries(newSelected));
  }, [checked]);

  return(
    <CheckButtonsView
      options={options?.map(toOptionWithSelected)}
      onClick={onClick ? handleClick : () => null}
      disabled={disabled}
    />
  );
}