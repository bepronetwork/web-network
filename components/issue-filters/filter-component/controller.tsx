import { IssueFilterBoxOption } from "interfaces/filters";

import FilterComponentView from "./view";

export default function FilterComponent({
  label,
  options,
  onChange
}: {
  label: string;
  options: IssueFilterBoxOption[];
  onChange: (e) => void;
}) {

  function getCurrentFilter(options: IssueFilterBoxOption[]) {
    return options?.find(({ checked }) => checked);
  }

  return (
    <FilterComponentView
      label={label}
      options={options}
      handleCurrentFilter={getCurrentFilter}
      handleChange={onChange}
    />
  );
}
