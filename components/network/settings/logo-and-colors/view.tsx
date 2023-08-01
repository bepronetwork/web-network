import { Col, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import ThemeColors from "components/custom-network/theme-colors";
import If from "components/If";
import ImageUploader from "components/image-uploader";
import NetworkTabContainer from "components/network/settings/tab-container/view";

import { formatDate } from "helpers/formatDate";

import { Field, Icon, Network, Theme } from "interfaces/network";

interface NetworkLogoAndColorsSettingsViewProps {
  baseUrl: string;
  network: Network;
  networkTheme: Theme;
  isEmptyTheme?: boolean;
  iconLogoField: Field<Icon>;
  fullLogoField: Field<Icon>;
  isLogosSizeTooLarge?: boolean;
  queryableNetworkName: string;
  onColorChange: (value: string) => void;
  onIconLogoChange: (value: Icon) => void;
  onFullLogoChange: (value: Icon) => void;
}

export default function NetworkLogoAndColorsSettingsView({
  baseUrl,
  network,
  networkTheme,
  isEmptyTheme,
  iconLogoField,
  fullLogoField,
  isLogosSizeTooLarge,
  queryableNetworkName,
  onColorChange,
  onIconLogoChange,
  onFullLogoChange,
}: NetworkLogoAndColorsSettingsViewProps) {
  const { t } = useTranslation(["common", "custom-network"]);

  return (
    <NetworkTabContainer>
      <Row className="align-items-end mt-4 gap-5 gap-xl-0">
        <Col xs={12} lg={6} xl={5}>
          <Row>
            <h3 className="text-capitalize family-Regular text-white overflow-wrap-anywhere">
              {network?.name}
            </h3>
          </Row>

          <Row className="mb-2 mt-4">
            <span className="caption-small font-weight-medium text-gray-400">
              {t("custom-network:query-url")}
            </span>
          </Row>

          <Row className="mb-2">
            <span className="caption-large font-weight-medium overflow-wrap-anywhere">
              <span className="text-white">
                {baseUrl}/
              </span>

              <span className="text-primary">
                {queryableNetworkName || t("custom-network:steps.network-information.fields.name.default")}
              </span>/

              <span>
                {network?.chain?.chainShortName}
              </span>
            </span>
          </Row>

          <Row className="mb-2 mt-4">
            <span className="caption-small font-weight-medium text-gray-400">
              {t("misc.creation-date")}
            </span>
          </Row>

          <Row>
            <span className="caption-large font-weight-medium text-white">
              {formatDate(network?.createdAt, "-")}
            </span>
          </Row>
        </Col>

        <Col xs="12" md="auto">
          <Row>
            <Col xs="auto">
              <ImageUploader
                name="logoIcon"
                value={iconLogoField?.value}
                isLoading={!iconLogoField?.value?.preview}
                className="bg-shadow"
                error={iconLogoField?.validated === false}
                onChange={onIconLogoChange}
                description={
                  <>
                    {t("misc.upload")} <br />{" "}
                    {t("custom-network:steps.network-information.fields.logo-icon.label")}
                  </>
                }
              />
            </Col>

            <Col xs="auto">
              <ImageUploader
                name="fullLogo"
                value={fullLogoField?.value}
                isLoading={!fullLogoField?.value?.preview}
                className="bg-shadow"
                error={fullLogoField?.validated === false}
                onChange={onFullLogoChange}
                description={`
                  ${t("misc.upload")} ${t("custom-network:steps.network-information.fields.full-logo.label")}
                `}
                lg
              />
              </Col>
          </Row>
        </Col>
      </Row>

      <If condition={isLogosSizeTooLarge}>
        <Row className="mb-2 justify-content-center">
          <Col xs="auto">
              <small className="text-danger small-info mt-1">
                {t("custom-network:errors.images-too-big")}
              </small>
          </Col>
        </Row>
      </If>

      <Row className="mt-4">
        <Col className="mt-4">
          <span className="caption-medium font-weight-medium text-white mb-3">
            {t("custom-network:steps.network-settings.fields.colors.label")}
          </span>

          <If 
            condition={!isEmptyTheme}
            otherwise={
              <div className="row justify-content-center">
                <span className="spinner-border spinner-border-md ml-1" />
              </div>
            }
          >
            <ThemeColors
              colors={networkTheme?.colors}
              similar={networkTheme?.similar}
              setColor={onColorChange}
            />
          </If>
        </Col>
      </Row>
    </NetworkTabContainer>
  );
}