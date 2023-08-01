import { useTranslation } from "next-i18next";

import NativeSelectWrapper from "components/common/native-select-wrapper/view";
import ReactSelect from "components/react-select";

import { Direction, SelectOption } from "types/utils";

interface ChainFilterViewProps {
  options: SelectOption[];
  option: SelectOption;
  direction: Direction;
  isMobile: boolean;
  onChange: (value: SelectOption) => void;
}

export default function ChainFilterView({
  options,
  option,
  direction,
  isMobile,
  onChange,
}: ChainFilterViewProps) {
  const { t } = useTranslation("common");

  const isHorizontal = direction === "horizontal";
  const labelClass = isHorizontal ? "col-auto" : "col-12";
  
  return(
    <div className="row align-items-center gx-2 gy-2">
      <div className={labelClass}>
        <label className="text-capitalize text-white font-weight-normal caption-medium">
          {t("misc.chain")}
        </label>
      </div>

      <div className="col">
        <NativeSelectWrapper
          options={options}
          onChange={onChange}
          selectedIndex={options?.findIndex(opt => opt?.value === option?.value)}
          isClearable
        >
          <ReactSelect
            options={options}
            value={option}
            onChange={onChange}
            isSearchable={false}
            placeholder={t("placeholders.select-chain")}
            isClearable={!isMobile}
          />
        </NativeSelectWrapper>
      </div>
    </div>
  );
}