import { Modal } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import LoadingDots from "assets/icons/loading-dots";

export default function CreatingNetworkLoader({
  currentStep,
  steps,
}) {
  const { t } = useTranslation(["custom-network"]);

  if (currentStep < 0)
    return <></>;

  const maxStep = steps?.reduce((max, step) => Math.max(max, step.id), 0);
  const show = !!(currentStep >= 0 && currentStep < steps.length);

  //note: zindex-2000 its necessary to modal be above the transactions dropdown
  return (
    <Modal show={show} fullscreen centered scrollable={false} className="zindex-2000">
      <Modal.Body className="d-flex flex-column align-items-center justify-content-center">
        <div className="d-flex flex-row align-items-end">
          <span className="caption-large text-white">
            Step ({steps[currentStep].id}/{maxStep}) {steps[currentStep].name}
          </span>{" "}
          <LoadingDots />
        </div>

        <p className="caption-medium text-gray mt-1">
          {t("modals.loader.dont-close-window")}
        </p>
      </Modal.Body>
    </Modal>
  );
}
