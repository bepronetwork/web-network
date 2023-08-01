import { ReactNode } from "react";

import { useTranslation } from "next-i18next";

import FilterIcon from "assets/icons/filter-icon";

import Button from "components/button";
import Modal from "components/modal";

interface MobileFiltersButtonViewProps {
  show: boolean;
  children: ReactNode;
  onShow: () => void;
  onClose: () => void;
  onConfirm: () => void;
}

export default function MobileFiltersButtonView({
  show,
  children,
  onShow,
  onClose,
  onConfirm,
}: MobileFiltersButtonViewProps) {
  const { t } = useTranslation("common");

  return(
    <>
      <Button
        color="gray-900"
        className={`border border-gray-800 rounded-2 not-svg p-2`}
        onClick={onShow}
      >
        <FilterIcon />
      </Button>

      <Modal
        title={t("filters.filters")}
        show={show}
        onCloseClick={onClose}
        cancelLabel={t("actions.cancel")}
        okLabel={t("actions.apply")}
        onOkClick={onConfirm}
      >
        {children}
      </Modal>
    </>
  );
}