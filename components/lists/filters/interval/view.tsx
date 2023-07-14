import { ChangeEvent } from "react";

import { useTranslation } from "next-i18next";

import ArrowRight from "assets/icons/arrow-right";

import NativeSelectWrapper from "components/common/native-select-wrapper/view";
import ReactSelect from "components/react-select";

import { Direction, SelectOption } from "types/utils";

interface IntervalFiltersViewProps {
  intervals: SelectOption[];
  interval: SelectOption;
  startDate: string;
  endDate: string;
  direction: Direction;
  onIntervalChange: (value: SelectOption) => void;
  onStartDateChange: (e: ChangeEvent<HTMLInputElement>) => void;
  onEndDateChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export default function IntervalFiltersView({
  intervals,
  interval,
  startDate,
  endDate,
  direction,
  onIntervalChange,
  onStartDateChange,
  onEndDateChange,
}: IntervalFiltersViewProps) {
  const { t } = useTranslation("common");

  const isHorizontal = direction === "horizontal";
  const containerClass = isHorizontal ? "col-3" : "col-12 mb-4";
  const labelClass = isHorizontal ? "col-auto" : "col-12";

  return (
    <div className="row align-items-center">
      <div className={containerClass}>
        <div className="row align-items-center gx-2 gy-2">
          <div className={labelClass}>
            <label className="text-capitalize text-white font-weight-normal caption-medium">
              {t("misc.latest")}
            </label>
          </div>

          <div className="col">
            <NativeSelectWrapper
              options={intervals}
              onChange={onIntervalChange}
              selectedIndex={intervals?.findIndex(opt => opt?.value === interval?.value)}
            >
              <ReactSelect
                options={intervals}
                value={interval}
                onChange={onIntervalChange}
                isSearchable={false}
                placeholder={t("placeholders.select-latest")}
              />
            </NativeSelectWrapper>
          </div>
        </div>
      </div>

      <div className="col">
        <div className="row align-items-center gx-2 gy-2">
          <div className={labelClass}>
            <label className="text-capitalize text-white font-weight-normal caption-medium">
              {t("profile:payments.period")}
            </label>
          </div>

          <div className="col">
            <input
              type="date"
              key="startDate"
              className="form-control"
              onChange={onStartDateChange}
              value={startDate}
              max={endDate}
            />
          </div>

          <div className="col-auto">
            <ArrowRight height="10px" width="10px" />
          </div>

          <div className="col">
            <input
              type="date"
              key="endDate"
              className="form-control"
              onChange={onEndDateChange}
              value={endDate}
              min={startDate}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
