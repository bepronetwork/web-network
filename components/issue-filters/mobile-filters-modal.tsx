import If from "components/If";
import Modal from "components/modal";
import ReactSelect from "components/react-select";

import useFilters from "x-hooks/use-filters";

interface MobileFiltersModalProps {
  show: boolean;
  hide: () => void;
  onlyTimeFrame?: boolean;
}

export default function MobileFiltersModal({
  show,
  hide,
  onlyTimeFrame
}: MobileFiltersModalProps) {
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
        <span className="caption-small font-weight-medium text-gray-100">{label}</span>
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
      title="Filters"
      show={show}
      onCloseClick={hide}
      cancelLabel="Cancel"
      okLabel="Apply"
      onOkClick={handleApply}
    >
      <If condition={!onlyTimeFrame}>
        {FilterComponent("Repository", repoOptions, "repo")}
        {FilterComponent("Bounty State", stateOptions, "state")}
      </If>
      
      {FilterComponent("Timeframe", timeOptions, "time")}
    </Modal>
  );
}