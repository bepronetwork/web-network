import { useTranslation } from "next-i18next";

import Step from "components/step";
import { WarningSpan } from "components/warning-span";

import { useNetworkSettings } from "contexts/network-settings";

import { StepWrapperProps } from "interfaces/stepper";

import NetworkContractSettings from "./network-contract-settings";
import NetworkParameterInput from "./network-parameter-input";
import ThemeColors from "./theme-colors";
import TreasuryAddressField from "./treasury-address-field";

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

      <Section title={t("custom-network:steps.network-settings.fields.fees.title")}>
        <div className="form-group col-8">
          <label className="caption-small mb-2">
            {t("custom-network:steps.treasury.fields.address.label")}
          </label>
          <TreasuryAddressField
            value={settings?.treasury?.address?.value}
            onChange={fields.treasury.setter}
            validated={settings?.treasury?.address?.validated}
            disabled={true}
          />
            <WarningSpan
              text={t("custom-network:steps.network-settings.fields.other-settings.warning-registry")}
            />
        </div>

        <NetworkParameterInput
          label={t("custom-network:steps.treasury.fields.cancel-fee.label")}
          symbol="%"
          value={settings?.treasury?.cancelFee?.value}
          error={settings?.treasury?.cancelFee?.validated === false}
          onChange={fields.cancelFee.setter}
          disabled={true}
          className="mt-1"
        />

        <NetworkParameterInput
          label={t("custom-network:steps.treasury.fields.close-fee.label")}
          symbol="%"
          value={settings?.treasury?.closeFee?.value}
          error={settings?.treasury?.closeFee?.validated === false}
          onChange={fields.closeFee.setter}
          disabled={true}
          className="mt-1"
        />
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