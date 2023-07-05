import { useTranslation } from "next-i18next";

import FilterIcon from "assets/icons/filter-icon";

import CustomDropdown from "components/common/custom-dropdown/view";
import NativeSelectWrapper from "components/common/native-select-wrapper/view";
import ReactSelect from "components/react-select";

import { CustomDropdownItem, SortOption } from "types/components";

interface ListSortProps {
  defaultOption?: SortOption;
  options: SortOption[];
  dropdownItems: CustomDropdownItem[];
  asSelect?: boolean;
  selectedIndex?: number;
  componentVersion: string;
  onChange: (newValue: SortOption) => void;
}

export default function ListSortView({
  defaultOption,
  options,
  dropdownItems,
  selectedIndex,
  onChange,
  asSelect,
  componentVersion,
}: ListSortProps) {
  const { t } = useTranslation("common");

  const labelClass = asSelect ? 
    "caption-small font-weight-medium text-gray-100 text-capitalize" : 
    "caption-small text-white-50 text-nowrap mr-1";
  const containerClass = asSelect ? "d-flex flex-column gap-1" : "d-flex align-items-center";

  if (!componentVersion)
    return <></>;

  if (componentVersion === "desktop" || asSelect)
    return (
      <div className={containerClass}>
        <span className={labelClass}>
          {t("sort.label")}
        </span>

        <ReactSelect
          defaultValue={defaultOption}
          options={options}
          isSearchable={false}
          onChange={onChange}
        />
      </div>
    );

  return (
    <NativeSelectWrapper
      options={options}
      onChange={onChange}
      selectedIndex={selectedIndex}
    >
      <CustomDropdown
        btnContent={<FilterIcon width={16} height={16} />}
        items={dropdownItems}
      />
    </NativeSelectWrapper>
  );
}
