import { ReactNode, useState } from "react";

import MobileFiltersButtonView from "components/lists/filters/mobile-button/view";

interface MobileFiltersButtonProps {
  children: ReactNode;
  onApply: () => void;
}

export default function MobileFiltersButton({
  children,
  onApply,
}: MobileFiltersButtonProps) {
  const [show, setShow] = useState(false);

  function handleShowModal() {
    setShow(true);
  }

  function handleCloseModal() {
    setShow(false);
  }

  function onConfirm() {
    onApply();
    handleCloseModal();
  }

  return (
    <MobileFiltersButtonView
      show={show}
      onShow={handleShowModal}
      onClose={handleCloseModal}
      onConfirm={onConfirm}
    >
      {children}
    </MobileFiltersButtonView>
  );
}
