import { useState } from "react";

import FilterIcon from "assets/icons/filter-icon";

import Button from "components/button";
import MobileFiltersModal from "components/issue-filters/mobile-filters-modal";

import { SupportedChainData } from "interfaces/supported-chain-data";

import { SortOption } from "types/components";

interface IssueMobileFiltersProps {
  onlyTimeFrame?: boolean;
  onlyProfileFilters?: boolean;
  sortOptions?: SortOption[];
  hideSort?: boolean;
  chainOptions?: SupportedChainData[];
}

export default function IssueMobileFilters({
  onlyTimeFrame = false,
  onlyProfileFilters = false,
  sortOptions,
  hideSort,
  chainOptions,
}: IssueMobileFiltersProps) {
  const [showModal, setShowModal] = useState(false);

  function handleShowModal() {
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
  }

  return (
    <>
      <Button
        color="gray-900"
        className={`border border-gray-800 rounded-2 not-svg`}
        onClick={handleShowModal}
      >
        <FilterIcon />
      </Button>

      <MobileFiltersModal
        show={showModal}
        hide={handleCloseModal}
        onlyTimeFrame={onlyTimeFrame}
        onlyProfileFilters={onlyProfileFilters}
        sortOptions={sortOptions}
        hideSort={hideSort}
        chainOptions={chainOptions}
      />
    </>
  );
}
