import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import SelectNetwork from "components/bounties/select-network";
import If from "components/If";
import ListSort from "components/lists/sort/controller";
import Modal from "components/modal";
import ChainSelector from "components/navigation/chain-selector/controller";

import { SortOption } from "types/components";

import useFilters from "x-hooks/use-filters";

import { ContainerFilterView } from "./container-filter/view";
import FilterComponent from "./filter-component/controller";

interface MobileFiltersModalProps {
  show: boolean;
  hide: () => void;
  onlyTimeFrame?: boolean;
  onlyProfileFilters?: boolean;
  sortOptions?: SortOption[];
  hideSort?: boolean;
  showChainSelector?: boolean;
}

export default function MobileFiltersModal({
  show,
  hide,
  onlyTimeFrame,
  onlyProfileFilters,
  sortOptions,
  showChainSelector,
  hideSort = false
}: MobileFiltersModalProps) {
  const { t } = useTranslation(["common"]);
  const router = useRouter();
  const isOnNetwork = !!router?.query?.network;

  const [ [repoOptions, stateOptions, timeOptions], , , , applyFilters ] = useFilters();

  
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

  function handleApply() {
    hide();
    applyFilters();
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
      <If condition={showChainSelector && !isOnNetwork}>
        <ContainerFilterView label={t("misc.chain")}>
          <ChainSelector isFilter />
        </ContainerFilterView>
      </If>
      <If condition={onlyProfileFilters}>
        <If condition={!hideSort}>
          <ListSort options={defaultSortOptions} labelLineBreak={onlyProfileFilters} />
        </If>

        <SelectNetwork
          isCurrentDefault={isOnNetwork}
          onlyProfileFilters={onlyProfileFilters}
          filterByConnectedChain
        />
      </If>

      <If condition={!onlyTimeFrame && !onlyProfileFilters}>
        <FilterComponent 
          label={t('filters.repository')}
          options={repoOptions}
          type="repo"
        />
        <FilterComponent 
          label={t('filters.bounties.title')}
          options={stateOptions}
          type="state"
        />
      </If>

      <If condition={onlyTimeFrame || !onlyProfileFilters}>
        <FilterComponent 
          label={t('filters.timeframe.title')}
          options={timeOptions}
          type="time"
        />

        <ListSort options={defaultSortOptions} asSelect />
      </If>
    </Modal>
  );
}