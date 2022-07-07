import { useState } from "react";

import { useTranslation } from "next-i18next";
import getConfig from "next/config";

import InputNumber from "components/input-number";
import Step from "components/step";

import { useNetwork } from "contexts/network";
import { useNetworkSettings } from "contexts/network-settings";

import { formatNumberToCurrency } from "helpers/formatNumber";

import { StepWrapperProps } from "interfaces/stepper";

import ThemeColors from "./theme-colors";

const { publicRuntimeConfig } = getConfig();

const MAX_PERCENTAGE_FOR_DISPUTE = +publicRuntimeConfig?.networkConfig?.disputesPercentage;
const MIN_DRAFT_TIME = +publicRuntimeConfig?.networkConfig?.reedemTime?.min;
const MAX_DRAFT_TIME = +publicRuntimeConfig?.networkConfig?.reedemTime?.max;
const MIN_DISPUTE_TIME = +publicRuntimeConfig?.networkConfig?.disputableTime?.min;
const MAX_DISPUTE_TIME = +publicRuntimeConfig?.networkConfig?.disputableTime?.max;
const MIN_COUNCIL_AMOUNT = +publicRuntimeConfig?.networkConfig?.councilAmount?.min;
const MAX_COUNCIL_AMOUNT = +publicRuntimeConfig?.networkConfig?.councilAmount?.max;

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

const ParameterInput = ({ label, description = null, symbol, value, onChange, error = false, onBlur = undefined}) => (
  <div className="form-group col">
    <InputNumber
      classSymbol={"text-primary"}
      symbol={symbol}
      value={value}
      label={label}
      description={description}
      min={0}
      placeholder={"0"}
      onValueChange={onChange}
      onBlur={onBlur}
      error={error}
      thousandSeparator
    />
  </div>
);

export default function NetworkSettingsStep({ activeStep, index, validated, handleClick } : StepWrapperProps) {
  const { t } = useTranslation(["common", "custom-network"]);

  const [address, setAddress] = useState("");

  const { fields, settings } = useNetworkSettings();
  const { activeNetwork } = useNetwork()

  const handleAddressChange = e => setAddress(e.target.value);
  const handleColorChange = value => fields.colors.setter(value);
  const handleCloseFeeChange = param => fields.closeFee.setter(param.floatValue);
  const handleCancelFeeChange = param => fields.cancelFee.setter(param.floatValue);
  const handleDraftTimeChange = ({ floatValue: value }) => fields.parameter.setter({ label: "draftTime", value });
  const handleDisputeTimeChange = 
    ({ floatValue: value }) => fields.parameter.setter({ label: "disputableTime", value });
  const handleCouncilAmountChange = 
    ({ floatValue: value }) => fields.parameter.setter({ label: "councilAmount", value });
  const handlePercentageForDisputeChange = 
    ({ floatValue: value }) => fields.parameter.setter({ label: "percentageNeededForDispute", value });

  const handleAddressBlur = () => fields.treasury.setter(address);
  const networkTokenSymbol = activeNetwork?.networkToken?.symbol || t("misc.$token");

  const parameterInputs = [
    { 
      label: t("custom-network:dispute-time"), 
      description: t("custom-network:errors.dispute-time", {
        min: MIN_DISPUTE_TIME,
        max: formatNumberToCurrency(MAX_DISPUTE_TIME, 0)
      }),
      symbol: t("misc.seconds"), 
      value: settings?.parameters?.disputableTime?.value,
      error: settings?.parameters?.disputableTime?.validated === false,
      onChange: handleDisputeTimeChange
    },
    { 
      label: t("custom-network:percentage-for-dispute"), 
      description: t("custom-network:errors.percentage-for-dispute", {
        max: MAX_PERCENTAGE_FOR_DISPUTE 
      }),
      symbol: "%", 
      value: settings?.parameters?.percentageNeededForDispute?.value,
      error: settings?.parameters?.percentageNeededForDispute?.validated === false,
      onChange: handlePercentageForDisputeChange
    },
    { 
      label: t("custom-network:redeem-time"), 
      description: t("custom-network:errors.redeem-time", {
        min: MIN_DRAFT_TIME,
        max: formatNumberToCurrency(MAX_DRAFT_TIME, 0)
      }),
      symbol: t("misc.seconds"), 
      value: settings?.parameters?.draftTime?.value,
      error: settings?.parameters?.draftTime?.validated === false,
      onChange: handleDraftTimeChange
    },
    { 
      label: t("custom-network:council-amount"), 
      description: t("custom-network:errors.council-amount", {
        token: networkTokenSymbol,
        min: formatNumberToCurrency(MIN_COUNCIL_AMOUNT, 0),
        max: formatNumberToCurrency(MAX_COUNCIL_AMOUNT, 0)
      }),
      symbol: "BEPRO", 
      value: settings?.parameters?.councilAmount?.value,
      error: settings?.parameters?.councilAmount?.validated === false,
      onChange: handleCouncilAmountChange
    }
  ];
  
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

          <input 
            type="text" 
            className="form-control" 
            value={address}
            onChange={handleAddressChange}
            onBlur={handleAddressBlur}
          />

          {
            settings?.treasury?.address?.validated === false && 
            <small className="small-info text-danger">
              {t("custom-network:steps.treasury.fields.address.error")}
            </small>
          }
        </div>

        <ParameterInput 
          label={t("custom-network:steps.treasury.fields.cancel-fee.label")}
          symbol="%"
          value={settings?.treasury?.cancelFee?.value}
          error={settings?.treasury?.cancelFee?.validated === false}
          onChange={handleCancelFeeChange}
        />

        <ParameterInput 
          label={t("custom-network:steps.treasury.fields.close-fee.label")}
          symbol="%"
          value={settings?.treasury?.closeFee?.value}
          error={settings?.treasury?.closeFee?.validated === false}
          onChange={handleCloseFeeChange}
        />
      </Section>

      <Section title={t("custom-network:steps.network-settings.fields.other-settings.title")}>
        <small className="small-info text-gray my-2">
          {t("custom-network:steps.network-settings.fields.other-settings.parameters-warning")}
        </small>

        {
        parameterInputs.map(({ label, description, symbol, value, error, onChange }) => 
          <ParameterInput 
            label={label}
            description={description}
            symbol={symbol}
            value={value}
            error={error}
            onChange={onChange}
          />)
        }
      </Section>
    </Step>
  );
}