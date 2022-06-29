import { useState } from "react";

import { useTranslation } from "next-i18next";

import InputNumber from "components/input-number";
import Step from "components/step";

import { useNetworkSettings } from "contexts/network-settings";

import { StepWrapperProps } from "interfaces/stepper";

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

const ParameterInput = ({ label, symbol, value, onChange, onBlur = undefined}) => (
  <div className="form-group col">
    <label className="caption-small mb-2">
      {label}
    </label>

    <InputNumber
      classSymbol={"text-primary"}
      symbol={symbol}
      value={value}
      min={0}
      placeholder={"0"}
      onValueChange={onChange}
      onBlur={onBlur}
    />
  </div>
);

export default function NetworkSettingsStep({ activeStep, index, validated, handleClick } : StepWrapperProps) {
  const { t } = useTranslation(["common", "custom-network"]);

  const [address, setAddress] = useState("");

  const { details, fields, treasury, parameters } = useNetworkSettings();

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
  
  return (
    <Step
      title={t("custom-network:steps.network-settings.title")}
      index={index}
      activeStep={activeStep}
      validated={validated}
      handleClick={handleClick}
    >
      <Section title="Colours">
        <div className="col">
          <ThemeColors
            colors={details.theme.colors}
            similar={details.theme.similar}
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
            treasury?.address?.validated === false && 
            <small className="small-info text-danger">
              {t("custom-network:steps.treasury.fields.address.error")}
            </small>
          }
        </div>

        <ParameterInput 
          label={t("custom-network:steps.treasury.fields.cancel-fee.label")}
          symbol="%"
          value={treasury?.cancelFee}
          onChange={handleCancelFeeChange}
        />

        <ParameterInput 
          label={t("custom-network:steps.treasury.fields.close-fee.label")}
          symbol="%"
          value={treasury?.closeFee}
          onChange={handleCloseFeeChange}
        />
      </Section>

      <Section title="Other Settings">
        <small className="small-info text-gray my-2">
          Changing these parameters will launch a new transaction for each one.
        </small>
        
        <ParameterInput 
          label="Dispute Time"
          symbol="SECONDS"
          value={parameters?.disputableTime?.value}
          onChange={handleDisputeTimeChange}
        />

        <ParameterInput 
          label="Percentage for Dispute"
          symbol="%"
          value={parameters?.percentageNeededForDispute?.value}
          onChange={handlePercentageForDisputeChange}
        />

        <ParameterInput 
          label="Draft Time"
          symbol="SECONDS"
          value={parameters?.draftTime?.value}
          onChange={handleDraftTimeChange}
        />

        <ParameterInput 
          label="Council Amount"
          symbol="BEPRO"
          value={parameters?.councilAmount?.value}
          onChange={handleCouncilAmountChange}
        />        
      </Section>
    </Step>
  );
}