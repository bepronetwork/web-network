import { ChangeEvent, useState } from "react";

import {
  format,
  subDays,
  subMonths,
  subYears,
} from "date-fns";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import IntervalFiltersView from "components/lists/filters/interval/view";

import { getDifferenceBetweenDates } from "helpers/formatDate";

import { IntervalFiltersProps } from "types/components";
import { SelectOption } from "types/utils";

import useQueryFilter from "x-hooks/use-query-filter";

export default function IntervalFilters({
  defaultInterval,
  intervals,
  intervalIn = "days",
  direction = "horizontal",
  onStartDateChange,
  onEndDateChange,
}: IntervalFiltersProps) {
  const { t } = useTranslation(["common"]);
  const router = useRouter();

  const { value, setValue } = useQueryFilter({ startDate: null, endDate: null });

  const now = new Date();
  const hasOnChangeCallbacks = !!onStartDateChange || !!onEndDateChange;

  function getInitialInterval() {
    if (!router?.query?.startDate || !router?.query?.endDate) {
      if (router?.query?.wallet)
        setValue(getIntervalDates(defaultInterval), !hasOnChangeCallbacks);

      return defaultInterval;
    }

    const diff = getDifferenceBetweenDates( router?.query?.startDate?.toString(), 
                                            router?.query?.endDate?.toString(),
                                            intervalIn);

    const isExistentIntervals = intervals?.includes(diff);

    return isExistentIntervals ? diff : null;
  }

  const [interval, setInterval] = useState<number>(getInitialInterval());

  const intervalToOption = (interval: number): SelectOption =>
  interval ? {
    value: interval,
    label: t(`info-data.${intervalIn}WithCount`, { count: interval }),
  } : null;

  function getIntervalDates(interval) {
    const formatDate = (date) => format(date, "yyyy-MM-dd").toString();
    const subFn = {
      days: subDays,
      months: subMonths,
      years: subYears,
    }[intervalIn];

    return {
      startDate: formatDate(subFn(new Date(), interval)),
      endDate: formatDate(now),
    };
  }

  function getIntervalFromDates(dateParam?: string, newValue?: string) {
    const tmpValue = {
      ...value,
      [dateParam]: newValue
    };

    const diff = getDifferenceBetweenDates(tmpValue.startDate, tmpValue.endDate, intervalIn);
    const isExistentInterval = intervals.includes(diff);

    return isExistentInterval ? diff : null;
  }

  function onIntervalChange({ value }: SelectOption) {
    setInterval(+value);
    const { startDate, endDate } = getIntervalDates(value);

    if (hasOnChangeCallbacks) {
      onStartDateChange?.(startDate);
      onEndDateChange?.(endDate);
    }
    
    setValue({ startDate, endDate }, !hasOnChangeCallbacks);
  }

  function onDateChange(dateParam: string) {
    return (e: ChangeEvent<HTMLInputElement>) => {
      const newValue = e.target.value;

      if (hasOnChangeCallbacks) {
        if (dateParam === "startDate") onStartDateChange?.(newValue);
        else if (dateParam === "endDate") onEndDateChange?.(newValue);
      }

      setValue({
        [dateParam]: newValue,
      }, !hasOnChangeCallbacks);

      setInterval(getIntervalFromDates(dateParam, newValue));
    };
  }

  return(
    <IntervalFiltersView
      intervals={intervals.map(intervalToOption)}
      interval={intervalToOption(interval)}
      startDate={value.startDate}
      endDate={value.endDate}
      onIntervalChange={onIntervalChange}
      onStartDateChange={onDateChange("startDate")}
      onEndDateChange={onDateChange("endDate")}
      direction={direction}
    />
  );
}
