import { Collapse } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import ConfirmIcon from "assets/icons/confirm-icon";

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

  const textColor = isActive ? "white" : (validated && "success" || "ligth-gray");
  const bgColor = !isActive && validated ? "bg-success-15" : "";

  function handleAction() {
    if (finishLabel) handleFinish?.();
    else handleClick?.(index + 1);
  }

  return (
    <div className={`step border-radius-8 px-4 py-3 ${bgColor}`}>
      <div
        className="d-flex flex-row align-items-center cursor-pointer"
        onClick={() => handleClick?.(index)}
      >
        {(validated && <span className="mr-2"><ConfirmIcon /></span>) || ""}
        <span
          className={`caption-medium text-${textColor}`}
        >{`${index + 1}. ${title}`}</span>
      </div>

      <Collapse in={isActive}>
        <div>
          <div className="row pt-2">{children}</div>

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
