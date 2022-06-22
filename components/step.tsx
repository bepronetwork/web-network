import { Collapse } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import SuccessIcon from "assets/icons/success-icon";

import Button from "components/button";

import { StepProps } from "interfaces/stepper";

export default function Step({
  title,
  index,
  activeStep,
  children,
  validated = false,
  finishLabel,
  handleClick,
  handleFinish
}: StepProps) {
  const { t } = useTranslation("common");

  const isActive = activeStep === index;

  function handleAction() {
    if (finishLabel) handleFinish?.();
    else handleClick?.(index + 1);
  }

  return (
    <div className="step border-radius-8 p-4">
      <div
        className="d-flex flex-row align-items-center cursor-pointer"
        onClick={() => handleClick?.(index)}
      >
        <span
          className={`caption-medium mr-1 ${
            isActive ? "text-white" : "text-ligth-gray"
          }`}
        >{`${index + 1}. ${title}`}</span>

        {(validated && <SuccessIcon />) || ""}
      </div>

      <Collapse in={isActive}>
        <div>
          <div className="row pt-4">{children}</div>

          {(validated && (
            <div className="d-flex flex-row justify-content-center">
              <Button onClick={handleAction}>
                {finishLabel || t("misc.next-step")}
              </Button>
            </div>
          )) || <></>}
        </div>
      </Collapse>
    </div>
  );
}
