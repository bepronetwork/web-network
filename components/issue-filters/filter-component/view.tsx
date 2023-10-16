import NativeSelectWrapper from "components/common/native-select-wrapper/view";
import ReactSelect from "components/react-select";

import { IssueFilterBoxOption } from "interfaces/filters";

import { ContainerFilterView } from "../container-filter/view";

export default function FilterComponentView({
  label,
  options,
  handleCurrentFilter,
  handleChange,
}: {
  label: string;
  options: IssueFilterBoxOption[];
  handleCurrentFilter: (v: IssueFilterBoxOption[]) => IssueFilterBoxOption;
  handleChange: (type: string) => void;
}) {
  return (
    <ContainerFilterView label={label}>
      <NativeSelectWrapper
        options={options}
        onChange={handleChange}
        selectedIndex={options?.findIndex((opt) => opt?.value === handleCurrentFilter(options)?.value)}
      >
        <ReactSelect
          value={handleCurrentFilter(options)}
          options={options}
          onChange={handleChange}
        />
      </NativeSelectWrapper>
    </ContainerFilterView>
  );
}
