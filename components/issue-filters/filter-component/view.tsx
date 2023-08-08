import ReactSelect from "components/react-select";

import { IssueFilterBoxOption } from "interfaces/filters";

import { ContainerFilterView } from "../container-filter/view";

export default function FilterComponentView({
  label,
  options,
  handleCurrentFilter,
  handleChange
}: {
  label: string;
  options: IssueFilterBoxOption[];
  handleCurrentFilter: (v: IssueFilterBoxOption[]) => void;
  handleChange: (type: string) => void
}) {
  return (
    <ContainerFilterView label={label}>
      <ReactSelect
        value={handleCurrentFilter(options)}
        options={options}
        onChange={handleChange}
      />
    </ContainerFilterView>
  );
}
