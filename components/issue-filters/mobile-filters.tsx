import { useState } from "react";

import FilterIcon from "assets/icons/filter-icon";

import Button from "components/button";
import MobileFiltersModal from "components/issue-filters/mobile-filters-modal";

export default function IssueMobileFilters({ onlyTimeFrame = false }) {
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
      />
    </>
  );
}
