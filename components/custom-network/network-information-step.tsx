import {useEffect, useState} from "react";

import {useTranslation} from "next-i18next";
import getConfig from "next/config";
import {useDebounce} from "use-debounce";

import ImageUploader from "components/image-uploader";
import Step from "components/step";

import {useNetworkSettings} from "contexts/network-settings";

import {getQueryableText, urlWithoutProtocol} from "helpers/string";

import {StepWrapperProps} from "interfaces/stepper";

const { publicRuntimeConfig } = getConfig();

export default function NetworkInformationStep({ activeStep, index, validated, handleClick } : StepWrapperProps) {
  const { t } = useTranslation(["common", "custom-network"]);

  const { details, fields } = useNetworkSettings();
  const [nameInput, setNameInput] = useState("")
  const [descriptionInput, setDescriptionInput] = useState("")
  const [dName] = useDebounce(nameInput, 100);
  const [dDescription] = useDebounce(descriptionInput, 100);

  const name = details.name;
  const nameInputClass = name.validated !== undefined ? (name.validated === true && "is-valid") || "is-invalid" : "";

  function showTextOrDefault(text: string, defaultText: string) {
    return text.trim() === "" ? defaultText : text;
  }

  function handleBlur(e) {
    fields.name.validator(e.target.value);
  }

  function handleIconChange(value) {
    fields.logo.setter(value, "icon");
  }

  function handleFullChange(value) {
    fields.logo.setter(value, "full");
  }

  useEffect(() => { fields.name.setter(dName); }, [dName])
  useEffect(() => { fields.description.setter(dDescription); }, [dDescription])

  return (
    <Step
      title={t("custom-network:steps.network-information.title")}
      index={index}
      activeStep={activeStep}
      validated={validated}
      handleClick={handleClick}
    >
      <span className="caption-small text-gray mb-4">
        {t("custom-network:steps.network-information.you-can-change")}
      </span>

      <div className="d-flex gap-20 mb-5 align-items-center">
        <div className="d-flex flex-column">
          <div className="d-flex gap-20">
            <ImageUploader
              name="logoIcon"
              value={details.iconLogo.value}
              error={details.iconLogo.validated === false}
              onChange={handleIconChange}
              description={
                <>
                  {t("misc.upload")} <br />{" "}
                  {t("custom-network:steps.network-information.fields.logo-icon.label")}
                </>
              }
            />

            <ImageUploader
              name="fullLogo"
              value={details.fullLogo.value}
              error={details.fullLogo.validated === false}
              onChange={handleFullChange}
              description=
                {`${t("misc.upload")} ${t("custom-network:steps.network-information.fields.full-logo.label")}`}
              lg
            />
          </div>

          <p className="p-small text-gray mb-0 mt-2">
            {t("custom-network:steps.network-information.logo-helper")}
          </p>
        </div>

        <div className="col ml-2">
          <p className="h3 text-white mb-3">
            {showTextOrDefault(nameInput, t("custom-network:steps.network-information.fields.name.default"))}
          </p>
          <p className="caption-small text-light-gray mb-2">
            {t("custom-network:steps.network-information.fields.name.temporary")}
          </p>
          <p className="caption-small text-gray">
            {urlWithoutProtocol(publicRuntimeConfig?.urls?.home)}/
            <span className="text-primary">
              {getQueryableText(nameInput || t("custom-network:steps.network-information.fields.name.default"))}
            </span>
          </p>
        </div>
      </div>

      <div className="row mx-0 px-0 mb-3">
        <div className="col">
          <label htmlFor="display-name" className="caption-small mb-2">
            {t("custom-network:steps.network-information.fields.name.label")}
          </label>

          <input
            type="text"
            name="display-name"
            id="display-name"
            placeholder={t("custom-network:steps.network-information.fields.name.default")}
            className={`form-control ${nameInputClass}`}
            defaultValue={nameInput}
            onChange={(e) => { setNameInput(e?.target?.value || '') }}
            onBlur={handleBlur}
          />

          {(name.validated === undefined && (
            <p className="p-small text-gray opacity-75 mt-2 mb-0">
              {t("custom-network:steps.network-information.fields.name.helper")}
            </p>
          )) || (
            <>
              <p className="valid-feedback p-small mt-2 mb-0">
                {t("custom-network:steps.network-information.fields.name.available")}
              </p>
              <p className="invalid-feedback p-small mt-2 mb-0">
                {t("custom-network:steps.network-information.fields.name.unavailable")}
              </p>
            </>
          )}
        </div>
      </div>

      <div className="row mx-0 px-0 mb-3">
        <div className="col">
          <label htmlFor="description" className="caption-small mb-2">
            {t("custom-network:steps.network-information.fields.description.label")}
          </label>

          <textarea
            name="description"
            id="description"
            placeholder={t("custom-network:steps.network-information.fields.description.placeholder")}
            cols={30}
            rows={5}
            className="form-control"
            defaultValue={descriptionInput}
            onChange={(e) => { setDescriptionInput(e?.target?.value || ``)} }
          ></textarea>
        </div>
      </div>
    </Step>
  );
}