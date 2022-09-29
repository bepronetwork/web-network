import { useTranslation } from "next-i18next";

import Step from "components/step";
import { WarningSpan } from "components/warning-span";

import { useNetworkSettings } from "contexts/network-settings";

import { StepWrapperProps } from "interfaces/stepper";

import NetworkContractSettings from "./network-contract-settings";
import ThemeColors from "./theme-colors";

const Section = ({ children = undefined, title }) => (
  <div className="row mx-0 px-0 mb-2 mt-1">
    <div className="row mx-0 px-0 mb-2">
      <span className="caption-small text-white">
        {title}
      </span>
    </div>

    {children}
  </div>
);

export default function NetworkSettingsStep({ activeStep, index, validated, handleClick } : StepWrapperProps) {
  const { t } = useTranslation(["common", "custom-network"]);

  const { fields, settings } = useNetworkSettings();

  const handleColorChange = value => fields.colors.setter(value);

  return (
    <Step
      title={t("custom-network:steps.network-settings.title")}
      index={index}
      activeStep={activeStep}
      validated={validated}
      handleClick={handleClick}
    >
      <Section title={t("custom-network:steps.network-settings.fields.colors.label")}>
        <div className="col">
          <ThemeColors
            colors={settings?.theme?.colors}
            similar={settings?.theme?.similar}
            setColor={handleColorChange}
          />
        </div>
      </Section>

      <Section title={t("custom-network:steps.network-settings.fields.other-settings.title")}>
        <NetworkContractSettings/> 
        <WarningSpan
          text={t("custom-network:steps.network-settings.fields.other-settings.parameters-warning")}
        />
      </Section>
    </Step>
  );
}