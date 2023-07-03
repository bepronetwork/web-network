import { useTranslation } from "next-i18next";

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
  sortOptions?: SortOption[];
}

export default function MobileFiltersModal({
  show,
  hide,
  onlyTimeFrame,
  sortOptions
}: MobileFiltersModalProps) {
  const { t } = useTranslation("common");

  const [ [repoOptions, stateOptions, timeOptions], , , checkOption, applyFilters ] = useFilters();

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
      <If condition={!onlyTimeFrame}>
        {FilterComponent(t("filters.repository"), repoOptions, "repo")}
        {FilterComponent(t("filters.bounties.title"), stateOptions, "state")}
      </If>
      
      {FilterComponent(t("filters.timeframe.title"), timeOptions, "time")}

      <ListSort options={sortOptions} asSelect />
    </Modal>
  );
}