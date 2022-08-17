import { useTranslation } from "next-i18next";

import LoadingDots from "assets/icons/loading-dots";

export default function CreatingNetworkLoader({
  currentStep,
  steps
}) {
  const { t } = useTranslation(["custom-network"]);

  const maxStep = steps?.reduce((max, step) => Math.max(max, step.id), 0);

  return (
    <div className="creating-network-loader">
      <div className="d-flex flex-row align-items-end">
        <span className="caption-large text-white">
          Step ({steps[currentStep].id}/{maxStep}) {steps[currentStep].name}
        </span>{" "}
        <LoadingDots />
      </div>

      <p className="caption-medium text-gray mt-1">
        {t("modals.loader.dont-close-window")}
      </p>
    </div>
  );
}
