import { useTranslation } from "next-i18next";

import Modal from "components/modal";

interface OriginLinkWarningModalProps {
  show: boolean;
  originLink: string;
  onClose: () => void;
}

export default function OriginLinkWarningModal({
  show,
  originLink,
  onClose
}: OriginLinkWarningModalProps) {
  const { t } = useTranslation("bounty");

  return(
    <Modal
      centerTitle
      show={show}
      title={t("modals.origin-link-warning.title")}
      onCloseClick={onClose}
    >
      <div className="d-flex flex-column align-items-center">
        <p className="text-center text-gray">
          {t("modals.origin-link-warning.you-are-going-to")}
        </p>

        <p className="text-center text-primary">
          {originLink}
        </p>

        <p className="text-center text-gray">
          {t("modals.origin-link-warning.provided-by")}
        </p>

        <a href={originLink} onClick={onClose} className="btn btn-primary" target="_blank" rel="noopener noreferer">
          {t("modals.origin-link-warning.open-link")}
        </a>
      </div>
    </Modal>
  );
}