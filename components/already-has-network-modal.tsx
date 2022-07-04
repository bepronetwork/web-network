import { useTranslation } from "next-i18next";

import Modal from "components/modal";

export default function AlreadyHasNetworkModal({
  show,
  onOkClick
}) {
  const { t } = useTranslation(["common"]);

  return(
    <Modal
        title={t("modals.already-has-network.title")}
        centerTitle
        show={show}
        okLabel={t("modals.already-has-network.button-label")}
        onOkClick={onOkClick}
      >
        <div className="text-center">
          <span className="caption-small">
            {t("modals.already-has-network.content")}
          </span>
        </div>
      </Modal>
  );
}