import { MouseEvent } from "react";

import Button from "components/button";

import { SelectOption } from "types/utils";

interface CheckButtonsViewProps {
  options: SelectOption[];
  onClick: (index: number) => (e: MouseEvent<HTMLButtonElement>) => void;
}

export default function CheckButtonsView({
  options,
  onClick,
}: CheckButtonsViewProps) {
  const selectedColor = "primary";
  const defaultColor = "gray-900 border-gray-700";

  return(
    <div className="d-flex">
      {options.map((opt, index) => 
        <Button
          key={`${opt.label}-${index}`}
          color={opt.selected ? selectedColor : defaultColor}
          className="border-radius-4 text-capitalize font-weight-normal text-gray-50"
          onClick={onClick(index)}
        >
        {opt.label}
      </Button>)}
    </div>
  );
}