import { useState } from "react";

import { Defaults } from "@taikai/dappkit";
import { useTranslation } from "next-i18next";

import Step from "components/step";

import { useNetworkSettings } from "contexts/network-settings";

export default function TreasuryStep({
  step,
  handleFinish,
  currentStep,
  handleChangeStep
}) {
  const { t } = useTranslation(["common", "custom-network"]);

  const [address, setAddress] = useState(Defaults.nativeZeroAddress);
  const [closeFee, setCloseFee] = useState(5);
  const [cancelFee, setCancelFee] = useState(1);
  
  const { treasury, fields } = useNetworkSettings();

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
  
  return(
    <Step
      title={t("custom-network:steps.treasury.title")}
      index={step}
      activeStep={currentStep}
      validated={treasury.validated !== false}
      handleClick={handleChangeStep}
      finishLabel={t("custom-network:steps.repositories.submit-label")}
      handleFinish={handleFinish}
    >
      <div className="row align-items-top">
        <div className="form-group col-6">
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
            </small> ||
            <small className="small-info text-info">
              {t("custom-network:steps.treasury.fields.address.info")}
            </small>
          }
        </div>

        <div className="form-group col-3">
          <label className="caption-small mb-2">
            {t("custom-network:steps.treasury.fields.cancel-fee.label")}
          </label>

          <input 
            type="text" 
            className="form-control" 
            value={cancelFee}
            onChange={handleCancelFeeChange}
            onBlur={handleCancelFeeBlur}
          />
        </div>

        <div className="form-group col-3">
          <label className="caption-small mb-2">
            {t("custom-network:steps.treasury.fields.close-fee.label")}
          </label>

          <input 
            type="text" 
            className="form-control" 
            value={closeFee}
            onChange={handleCloseFeeChange}
            onBlur={handleCloseFeeBlur}
          />
        </div>
      </div>
    </Step>
  );
}