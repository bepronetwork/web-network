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

const ParameterInput = ({ label, symbol, value, onChange, onBlur}) => (
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
  const [cancelFee, setCancelFee] = useState(1);
  const [closeFee, setCloseFee] = useState(5);
  const [disputeTime, setDisputeTime] = useState(259200);
  const [percentageForDispute, setPercentageForDispute] = useState(3);
  const [draftTime, setDraftTime] = useState(86400);
  const [councilAmount, setCouncilAmount] = useState(25000000);

  const { details, fields, treasury } = useNetworkSettings();

  function handleColorChange(value) {
    fields.colors.setter(value);
  }

  function handleAddressChange(e) {
    setAddress(e.target.value);
  }

  function handleAddressBlur() {
    fields.treasury.setter(address);
  }

  function handleCancelFeeChange(e) {
    setCancelFee(e.target.value);
  }

  function handleCancelFeeBlur() {
    fields.cancelFee.setter(address);
  }

  function handleCloseFeeChange(e) {
    setCloseFee(e.target.value);
  }

  function handleCloseFeeBlur() {
    fields.closeFee.setter(address);
  }
  
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
          value={cancelFee}
          onChange={handleCancelFeeChange}
          onBlur={handleCancelFeeBlur}
        />

        <ParameterInput 
          label={t("custom-network:steps.treasury.fields.close-fee.label")}
          symbol="%"
          value={closeFee}
          onChange={handleCloseFeeChange}
          onBlur={handleCloseFeeBlur}
        />
      </Section>

      <Section title="Other Settings">
        <small className="small-info text-gray my-2">
          Changing these parameters will launch a new transaction for each one.
        </small>
        
        <ParameterInput 
          label="Dispute Time"
          symbol="SECONDS"
          value={disputeTime}
          onChange={handleCloseFeeChange}
          onBlur={handleCloseFeeBlur}
        />

        <ParameterInput 
          label="Percentage for Dispute"
          symbol="%"
          value={percentageForDispute}
          onChange={handleCloseFeeChange}
          onBlur={handleCloseFeeBlur}
        />

        <ParameterInput 
          label="Draft Time"
          symbol="SECONDS"
          value={draftTime}
          onChange={handleCloseFeeChange}
          onBlur={handleCloseFeeBlur}
        />

        <ParameterInput 
          label="Council Amount"
          symbol="BEPRO"
          value={councilAmount}
          onChange={handleCloseFeeChange}
          onBlur={handleCloseFeeBlur}
        />        
      </Section>
    </Step>
  );
}