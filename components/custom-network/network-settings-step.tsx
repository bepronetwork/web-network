import { useTranslation } from "next-i18next";

import Step from "components/step";

import { useNetworkSettings } from "contexts/network-settings";

import { StepWrapperProps } from "interfaces/stepper";

import ThemeColors from "./theme-colors";

export default function NetworkSettingsStep({ activeStep, index, validated, handleClick } : StepWrapperProps) {
  const { t } = useTranslation(["common", "custom-network"]);

  const { details, fields } = useNetworkSettings();

  function handleColorChange(value) {
    fields.colors.setter(value);
  }
  
  return (
    <Step
      title={t("custom-network:steps.network-settings.title")}
      index={index}
      activeStep={activeStep}
      validated={validated}
      handleClick={handleClick}
    >
      <div className="row mx-0 px-0 mb-3">
        <div className="col">
          <ThemeColors
            colors={details.theme.colors}
            similar={details.theme.similar}
            setColor={handleColorChange}
          />
        </div>
      </div>
    </Step>
  );
}