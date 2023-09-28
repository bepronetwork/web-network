import { useTranslation } from "next-i18next";

import Modal from "components/modal";

interface MakeDeliverableRedyModalViewProps {
  isVisible: boolean;
  isExecuting: boolean;
  isActionDisabled: boolean;
  onClose: () => void;
  onMakeReady: () => void;
}

export default function MakeDeliverableRedyModalView({
  isVisible,
  isExecuting,
  isActionDisabled,
  onClose,
  onMakeReady,
}: MakeDeliverableRedyModalViewProps) {
  const { t } = useTranslation(["common", "deliverable"]);

  return(
    <Modal
      show={isVisible}
      title={t("deliverable:modals.make-ready.title")}
      cancelLabel={t("actions.cancel")}
      okLabel={t("deliverable:modals.make-ready.action")}
      onCloseClick={onClose}
      onOkClick={onMakeReady}
      isExecuting={isExecuting}
      okDisabled={isActionDisabled}
    >
      <div className="text-center mt-4">
        <p className="xs-medium">
          {t("deliverable:modals.make-ready.description")}
        </p>
      </div>
    </Modal>
  );
}