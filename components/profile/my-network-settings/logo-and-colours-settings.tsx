import { useState } from "react";
import { Col, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";
import getConfig from "next/config";

import InfoIconEmpty from "assets/icons/info-icon-empty";

import Button from "components/button";
import AmountCard from "components/custom-network/amount-card";
import ThemeColors from "components/custom-network/theme-colors";
import ImageUploader from "components/image-uploader";

import { useAppState } from "contexts/app-state";
import { useNetworkSettings } from "contexts/network-settings";
import { addToast } from "contexts/reducers/change-toaster";

import { formatDate } from "helpers/formatDate";
import { getQueryableText, urlWithoutProtocol } from "helpers/string";

import { MetamaskErrors } from "interfaces/enums/Errors";
import { Network } from "interfaces/network";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import { useNetwork } from "x-hooks/use-network";

interface Props {
  networkNeedRegistration: boolean;
  network: Network;
  updateEditingNetwork: () => void;
  errorBigImages: boolean
}

const { publicRuntimeConfig } = getConfig();

export default function LogoAndColoursSettings({
  networkNeedRegistration,
  network,
  updateEditingNetwork,
  errorBigImages
}: Props) {
  const { t } = useTranslation(["common", "custom-network"]);
  const [isRegistering, setIsRegistering] = useState(false);

  const {state, dispatch} = useAppState();

  const { processEvent } = useApi();
  const { handleAddNetworkToRegistry } = useBepro();
  const { updateActiveNetwork } = useNetwork();

  const {
    details,
    fields,
    settings,
    forcedNetwork,
  } = useNetworkSettings();

  const handleColorChange = (value) => fields.colors.setter(value);

  const isCurrentNetwork = (!!network &&
                            !!state.Service?.network?.active &&
                            network?.networkAddress === state.Service?.network?.active?.networkAddress)

  const tvl = (+forcedNetwork?.tokensStaked || 0) + (+forcedNetwork?.tokensLocked || 0);

  const NetworkAmount = (title, description, amount) => ({
    title,
    description,
    amount,
  });

  const networkAmounts = [
    NetworkAmount(t("custom-network:tokens-staked", {
        symbol: forcedNetwork?.networkToken?.symbol,
    }),
                  t("custom-network:tokens-staked-description"),
                  forcedNetwork?.tokensStaked || 0),
    NetworkAmount(t("custom-network:oracles-staked", {
        symbol: forcedNetwork?.networkToken?.symbol,
    }),
                  t("custom-network:oracles-staked-description"),
                  forcedNetwork?.tokensLocked || 0),
    NetworkAmount(t("custom-network:tvl"),
                  t("custom-network:tvl-description"),
                  tvl),
  ];

  const showTextOrDefault = (text: string, defaultText: string) =>
    text?.trim() === "" ? defaultText : text;

  const handleIconChange = (value) => fields.logo.setter(value, "icon");
  const handleFullChange = (value) => fields.logo.setter(value, "full");


  function handleRegisterNetwork() {
    if (!network) return;

    setIsRegistering(true);

    handleAddNetworkToRegistry(network.networkAddress)
      .then((txInfo) => {
        return processEvent("registry", "registered", network.name, {
          fromBlock: txInfo.blockNumber,
        });
      })
      .then(() => {
        if (isCurrentNetwork) updateActiveNetwork(true);

        return updateEditingNetwork();
      })
      .catch((error) => {
        if (error?.code !== MetamaskErrors.UserRejected)
          dispatch(addToast({
              type: "danger",
              title: t("actions.failed"),
              content: t("custom-network:errors.failed-to-create-network", {
                error,
              }),
          }));

        console.debug("Failed to add to registry",
                      network.networkAddress,
                      error);
      })
      .finally(() => setIsRegistering(false));
  }

  return (
    <>
      {networkNeedRegistration && (
        <Row className="bg-warning-opac-25 py-2 border border-warning border-radius-4 align-items-center mb-2">
          <Col xs="auto">
            <InfoIconEmpty width={12} height={12} />
            <span className="ml-1 caption-small">
              {t("custom-network:errors.network-not-registered")}
            </span>
          </Col>
          <Col xs="auto">
            <Button
              color="warning"
              onClick={handleRegisterNetwork}
              disabled={
                !state.currentUser?.walletAddress ||
                !state.currentUser?.accessToken ||
                isRegistering
              }
              withLockIcon={
                !state.currentUser?.walletAddress ||
                !state.currentUser?.accessToken
              }
              isLoading={isRegistering}
            >
              {t("actions.register")}
            </Button>
          </Col>
        </Row>
      )}
      <Row className="mb-3">
        <h3 className="text-capitalize family-Regular text-white">
          {network?.name}
        </h3>
      </Row>

      <Row className="mb-4 align-items-end">
        <Col xs="auto">
          <Row className="mb-2">
            <span className="caption-small text-gray">
              {t("custom-network:query-url")}
            </span>
          </Row>

          <Row className="mb-2">
            <span className="caption-large">
              <span className="text-white">
                {urlWithoutProtocol(publicRuntimeConfig?.urls?.api)}/
              </span>
              <span className="text-primary">
                {showTextOrDefault(getQueryableText(network?.name || ""),
                                   t("custom-network:steps.network-information.fields.name.default"))}
              </span>
            </span>
          </Row>

          <Row className="mb-2">
            <span className="caption-small text-gray">
              {t("misc.creation-date")}
            </span>
          </Row>

          <Row>
            <span className="caption-large text-white">
              {formatDate(network?.createdAt, "-")}
            </span>
          </Row>
        </Col>

        <Col xs="auto">
          <ImageUploader
            name="logoIcon"
            value={details?.iconLogo?.value}
            className="bg-shadow"
            error={details?.iconLogo?.validated === false}
            onChange={handleIconChange}
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
            value={details?.fullLogo?.value}
            className="bg-shadow"
            error={details?.fullLogo?.validated === false}
            onChange={handleFullChange}
            description={`
          ${t("misc.upload")} ${t("custom-network:steps.network-information.fields.full-logo.label")}
          `}
            lg
          />
        </Col>
      </Row>
      <Row className="mb-2 justify-content-center">
        <Col xs="auto">
          {errorBigImages && (
            <small className="text-danger small-info mt-1">
              {t("custom-network:errors.images-too-big")}
            </small>
          )}
        </Col>
      </Row>
      <Row>
        {networkAmounts.map((amount) => (
          <Col xs={3} key={amount.title}>
            <AmountCard {...amount} />
          </Col>
        ))}
      </Row>
      <Row className="mt-4">
        <Col>
          <span className="caption-medium text-white mb-3">
            {t("custom-network:steps.network-settings.fields.colors.label")}
          </span>

          <ThemeColors
            colors={settings?.theme?.colors}
            similar={settings?.theme?.similar}
            setColor={handleColorChange}
          />
        </Col>
      </Row>
    </>
  );
}
