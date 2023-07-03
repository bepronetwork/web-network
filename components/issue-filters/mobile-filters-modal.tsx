import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import SelectNetwork from "components/bounties/select-network";
import If from "components/If";
import ListSort from "components/lists/sort/controller";
import Modal from "components/modal";
import ReactSelect from "components/react-select";

import { SortOption } from "types/components";

import useFilters from "x-hooks/use-filters";

interface MobileFiltersModalProps {
  show: boolean;
  hide: () => void;
  onlyTimeFrame?: boolean;
  onlyProfileFilters?: boolean;
  sortOptions?: SortOption[];
}

export default function MobileFiltersModal({
  show,
  hide,
  onlyTimeFrame,
  onlyProfileFilters,
  sortOptions
}: MobileFiltersModalProps) {
  const { t } = useTranslation(["common"]);
  const router = useRouter();
  const isOnNetwork = !!router?.query?.network;

  const [ [repoOptions, stateOptions, timeOptions], , , checkOption, applyFilters ] = useFilters();

  
  const defaultSortOptions = sortOptions ? sortOptions : [
    {
      value: "newest",
      sortBy: "createdAt",
      order: "DESC",
      label: t("sort.types.newest")
    },
    {
      value: "oldest",
      sortBy: "createdAt",
      order: "ASC",
      label: t("sort.types.oldest")
    },
    {
      value: "highest-bounty",
      sortBy: "amount,fundingAmount",
      order: "DESC",
      label: t("sort.types.highest-bounty")
    },
    {
      value: "lowest-bounty",
      sortBy: "amount,fundingAmount",
      order: "ASC",
      label: t("sort.types.lowest-bounty")
    }
  ];

  function getCurrentFilter(options) {
    return options?.find(({ checked }) => checked);
  }

  function handleChange(type) {
    return (value) => {
      checkOption(value, type);
    };
  }

  function handleApply() {
    hide();
    applyFilters();
  }

  function FilterComponent(label, options, type) {
    return(
      <div className="mb-3">
        <span className="caption-small font-weight-medium text-gray-100 text-capitalize">{label}</span>
        <ReactSelect
          value={getCurrentFilter(options)}
          options={options}
          onChange={handleChange(type)}
        />
      </div>
    );
  }

  return(
    <Modal
      title={t("filters.filters")}
      show={show}
      onCloseClick={hide}
      cancelLabel={t("actions.cancel")}
      okLabel={t("actions.apply")}
      onOkClick={handleApply}
    >
      <If condition={onlyProfileFilters}>
        <ListSort options={defaultSortOptions} labelLineBreak={onlyProfileFilters} />
        <SelectNetwork
          isCurrentDefault={isOnNetwork}
          onlyProfileFilters={onlyProfileFilters}
        />
      </If>

      <If condition={!onlyTimeFrame && !onlyProfileFilters}>
        {FilterComponent("Repository", repoOptions, "repo")}
        {FilterComponent("Bounty State", stateOptions, "state")}
      </If>

      <If condition={onlyTimeFrame || !onlyProfileFilters}>
        {FilterComponent("Timeframe", timeOptions, "time")}

        <ListSort options={defaultSortOptions} asSelect />
      </If>
    </Modal>
  );
}