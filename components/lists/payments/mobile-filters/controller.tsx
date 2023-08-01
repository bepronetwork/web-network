import { useState, useEffect } from "react";

import ChainFilter from "components/lists/filters/chain/controller";
import IntervalFilters from "components/lists/filters/interval/controller";
import MobileFiltersButton from "components/lists/filters/mobile-button/controller";

import { ChainFilterProps, IntervalFiltersProps } from "types/components";

import useQueryFilter from "x-hooks/use-query-filter";

type PaymentsListMobileFiltersProps = IntervalFiltersProps & ChainFilterProps;

export default function PaymentsListMobileFilters({
  defaultInterval,
  intervals,
  chains,
}: PaymentsListMobileFiltersProps) {
  const [endDate, setEndDate] = useState<string>();
  const [startDate, setStartDate] = useState<string>();
  const [networkChain, setNetworkChain] = useState<string>();

  const { value, setValue } = useQueryFilter({ endDate, startDate, networkChain });

  const onChainChange = (value: string | number) => setNetworkChain(value?.toString());
  const onStartDateChange = (value: string) => setStartDate(value);
  const onEndDateChange = (value: string) => setEndDate(value);

  function applyFilters() {
    setValue({ endDate, startDate, networkChain }, true);
  }

  useEffect(() => {
    if (value?.endDate !== endDate) onEndDateChange(value?.endDate);
    if (value?.startDate !== startDate) onStartDateChange(value?.startDate);
    if (value?.networkChain !== networkChain) onChainChange(value?.networkChain);
  }, [value]);

  return(
    <MobileFiltersButton
      onApply={applyFilters}
    >
      <IntervalFilters
        defaultInterval={defaultInterval}
        intervals={intervals}
        direction="vertical"
        onStartDateChange={onStartDateChange}
        onEndDateChange={onEndDateChange}
      />

      <div className="mt-4">
        <ChainFilter
          chains={chains}
          direction="vertical"
          onChange={onChainChange}
        />
      </div>
    </MobileFiltersButton>
  );
}