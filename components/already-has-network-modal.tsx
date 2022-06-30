import { useTranslation } from "next-i18next";

import Modal from "components/modal";

export default function AlreadyHasNetworkModal({
  show,
  onOkClick
}) {
  const { t } = useTranslation(["common"]);

  return(
    <Modal
        title="Network already exists"
        centerTitle
        show={show}
        okLabel="My networks"
        onOkClick={onOkClick}
      >
        <div className="text-center">
          <span className="caption-small">
            Connected wallet already has a network.
          </span>
        </div>
      </Modal>
  );
}