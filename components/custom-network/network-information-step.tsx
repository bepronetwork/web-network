import { useTranslation } from "next-i18next";
import getConfig from "next/config";

import ThemeColors from "components/custom-network/theme-colors";
import ImageUploader from "components/image-uploader";
import Step from "components/step";

import { getQueryableText, urlWithoutProtocol } from "helpers/string";

import useNetwork from "x-hooks/use-network";

const { publicRuntimeConfig } = getConfig();

export default function NetworkInformationStep({
  data,
  step,
  setColor,
  validated,
  currentStep,
  handleChangeStep,
  changedDataHandler
}) {
  const { t } = useTranslation(["common", "custom-network"]);
  const { networkExists } = useNetwork();

  function showTextOrDefault(text: string, defaultText: string) {
    return text.trim() === "" ? defaultText : text;
  }

  function handleInputChange(e) {
    changedDataHandler({
      label: "displayName",
      value: {
        data: e.target.value,
        validated: undefined
      }
    });
  }

  async function handleBlur(e) {
    const name = e.target.value;
    const exists =
      name.trim() !== ""
        ? (name.toLowerCase().includes("bepro") || name.toLowerCase().includes("taikai"))
          ? false
          : !(await networkExists(name))
        : undefined;

    changedDataHandler({
      label: "displayName",
      value: {
        data: name,
        validated: exists
      }
    });
  }

  return (
    <Step
      title={t("custom-network:steps.network-information.title")}
      index={step}
      activeStep={currentStep}
      validated={validated}
      handleClick={handleChangeStep}
    >
      <span className="caption-small text-gray mb-4">
        {t("custom-network:steps.network-information.you-can-change")}
      </span>

      <div className="d-flex gap-20 mb-5 align-items-center">
        <div className="d-flex flex-column">
          <div className="d-flex gap-20">
            <ImageUploader
              name="logoIcon"
              value={data.logoIcon}
              error={
                data.logoIcon.raw &&
                !data.logoIcon.raw?.type?.includes("image/svg")
              }
              onChange={changedDataHandler}
              description={
                <>
                  {t("misc.upload")} <br />{" "}
                  {t("custom-network:steps.network-information.fields.logo-icon.label")}
                </>
              }
            />

            <ImageUploader
              name="fullLogo"
              value={data.fullLogo}
              error={
                data.fullLogo.raw &&
                !data.fullLogo.raw?.type?.includes("image/svg")
              }
              onChange={changedDataHandler}
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
            {showTextOrDefault(data.displayName.data,
                               t("custom-network:steps.network-information.fields.name.default"))}
          </p>
          <p className="caption-small text-ligth-gray mb-2">
            {t("custom-network:steps.network-information.fields.name.temporary")}
          </p>
          <p className="caption-small text-gray">
            {urlWithoutProtocol(publicRuntimeConfig?.apiUrl)}/
            <span className="text-primary">
              {getQueryableText(data.displayName.data ||
                  t("custom-network:steps.network-information.fields.name.default"))}
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
            className={`form-control ${
              data.displayName.validated !== undefined
                ? (data.displayName.validated === true && "is-valid") ||
                  "is-invalid"
                : ""
            }`}
            value={data.displayName.data}
            onChange={handleInputChange}
            onBlur={handleBlur}
          />

          {(data.displayName.validated === undefined && (
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
            value={data.networkDescription}
            onChange={(e) =>
              changedDataHandler({
                label: "networkDescription",
                value: e.target.value
              })
            }
          ></textarea>
        </div>
      </div>

      <div className="row mx-0 px-0 mb-3">
        <div className="col">
          <ThemeColors
            colors={data.colors.data}
            similar={data.colors.similar}
            setColor={setColor}
          />
        </div>
      </div>
    </Step>
  );
}
