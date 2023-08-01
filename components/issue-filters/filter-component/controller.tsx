import { IssueFilterBoxOption } from "interfaces/filters";

import useFilters from "x-hooks/use-filters";

import FilterComponentView from "./view";

export default function FilterComponent({
  label,
  options,
  type,
}: {
  label: string;
  options: IssueFilterBoxOption[];
  type: string;
}) {
  const [, , , checkOption] = useFilters();

  function handleChange(type) {
    return (value) => {
      checkOption(value, type);
    };
  }

  function getCurrentFilter(options) {
    return options?.find(({ checked }) => checked);
  }

  return (
    <FilterComponentView
      label={label}
      options={options}
      type={type}
      handleCurrentFilter={getCurrentFilter}
      handleChange={handleChange}
    />
  );
}
