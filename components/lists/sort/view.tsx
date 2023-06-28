import { useTranslation } from "next-i18next";

import FilterIcon from "assets/icons/filter-icon";

import CustomDropdown from "components/common/custom-dropdown/view";
import NativeSelectWrapper from "components/common/native-select-wrapper/view";
import ReactSelect from "components/react-select";

import { CustomDropdownItem, SortOption } from "types/components";

import useBreakPoint from "x-hooks/use-breakpoint";

interface ListSortProps {
  defaultOption?: SortOption;
  options: SortOption[];
  dropdownItems: CustomDropdownItem[];
  asSelect?: boolean;
  selectedIndex?: number;
  onChange: (newValue: SortOption) => void;
}

export default function ListSortView({
  defaultOption,
  options,
  dropdownItems,
  selectedIndex,
  onChange,
  asSelect,
}: ListSortProps) {
  const { t } = useTranslation("common");
  
  const { isDesktopView } = useBreakPoint();

  const labelClass = asSelect ? 
    "caption-small font-weight-medium text-gray-100 text-capitalize" : 
    "caption-small text-white-50 text-nowrap mr-1";

  if (isDesktopView || asSelect)
    return (
      <div className="d-flex align-items-center">
        <span className="caption text-gray-500 text-nowrap mr-1 font-weight-normal">
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
