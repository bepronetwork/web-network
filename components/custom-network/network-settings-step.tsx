import { useState } from "react";

import { useTranslation } from "next-i18next";

import InputNumber from "components/input-number";
import Step from "components/step";

import { useNetworkSettings } from "contexts/network-settings";

import { StepWrapperProps } from "interfaces/stepper";

import ThemeColors from "./theme-colors";

export default function NetworkSettingsStep({ activeStep, index, validated, handleClick } : StepWrapperProps) {
  const { t } = useTranslation(["common", "custom-network"]);

  const [address, setAddress] = useState("");
  const [cancelFee, setCancelFee] = useState("");
  const [closeFee, setCloseFee] = useState("");

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
      <div className="row mx-0 px-0 mb-3">
        <div className="col">
          <ThemeColors
            colors={details.theme.colors}
            similar={details.theme.similar}
            setColor={handleColorChange}
          />
        </div>
      </div>

      <div className="row mx-0 px-0 mb-3">
        <span className="caption-small mb-1 text-white">
          {t("custom-network:steps.network-settings.fees.title")}
        </span>
      </div>

      <div className="row mx-0 px-0 mb-3">
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

        <div className="form-group col-2">
          <label className="caption-small mb-2">
            {t("custom-network:steps.treasury.fields.cancel-fee.label")}
          </label>

          <InputNumber
            classSymbol={"text-white"}
            symbol="%"
            value={cancelFee}
            min={0}
            placeholder={"0"}
            onValueChange={handleCancelFeeChange}
          />
        </div>

        <div className="form-group col-2">
          <label className="caption-small mb-2">
            {t("custom-network:steps.treasury.fields.close-fee.label")}
          </label>

          <InputNumber
            classSymbol={"text-white"}
            symbol="%"
            value={closeFee}
            min={0}
            placeholder={"0"}
            onValueChange={handleCloseFeeChange}
          />
        </div>
      </div>
    </Step>
  );
}