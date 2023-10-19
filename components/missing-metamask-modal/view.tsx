import { useTranslation } from "next-i18next";
import Image from "next/image";

import ErrorMarkIcon from "assets/icons/errormark-icon";
import metamaskLogo from "assets/metamask.png";

import Button from "components/button";
import Modal from "components/modal";

export default function MissingMetamaskModalView({
  show,
  handleReload,
  handleClose
}: {
  show: boolean;
  handleReload: () => void;
  handleClose: () => void;
}) {
  const { t } = useTranslation("common");

  return (
    <Modal
      centerTitle
      size="lg"
      show={show}
      title={t("modals.missing-metamask.title")}
      footer={
        <div className="d-flex justify-content-center">
          <Button onClick={handleReload}>{t("actions.reload")}</Button>
        </div>
      }
      onCloseClick={handleClose}
    >
      <div>
        <div className="d-flex justify-content-center mb-2 mx-2 text-center flex-column mb-4">
          <div>
            <Image src={metamaskLogo} />
          </div>
          <p className="caption-small text-gray">
            {t("modals.missing-metamask.description")} 
          </p>
          <div><ErrorMarkIcon /></div>
        </div>
      </div>
    </Modal>
  );
}
