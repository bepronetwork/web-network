import { useEffect } from "react";
import { Col, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";
import getConfig from "next/config";

import AmountCard from "components/custom-network/amount-card";
import ImageUploader from "components/image-uploader";

import { useDAO } from "contexts/dao";
import { useNetworkSettings } from "contexts/network-settings";

import { formatDate } from "helpers/formatDate";
import { getQueryableText, urlWithoutProtocol } from "helpers/string";

import { Network } from "interfaces/network";

interface MyNetworkSettingsProps {
  network: Network;
}

const { publicRuntimeConfig: { apiUrl } } = getConfig();

export default function MyNetworkSettings({ network } : MyNetworkSettingsProps) {
  const { t } = useTranslation(["common", "custom-network"]);

  const { service: DAOService } = useDAO();
  const { details, fields, forcedNetwork, setForcedNetwork } = useNetworkSettings();

  const NetworkAmount = (title, description, amount) => ({ title, description, amount });

  const networkAmounts = [
    NetworkAmount(t("custom-network:tokens-staked", { symbol: forcedNetwork?.networkToken?.symbol }), 
                  t("custom-network:tokens-staked-description"), 
                  forcedNetwork?.tokensStaked || 0),
    NetworkAmount(t("custom-network:oracles-staked", { symbol: forcedNetwork?.networkToken?.symbol }), 
                  t("custom-network:oracles-staked-description"),
                  forcedNetwork?.tokensLocked || 0),
    NetworkAmount(t("custom-network:tvl"),  t("custom-network:tvl-description"), forcedNetwork?.tokensStaked || 0)
  ];

  const showTextOrDefault = (text: string, defaultText: string) => text?.trim() === "" ? defaultText : text;
  
  const handleIconChange = value => fields.logo.setter(value, "icon");
  const handleFullChange = value => fields.logo.setter(value, "full");
  
  useEffect(() => {
    if (!network) return;

    DAOService.loadNetwork(network.networkAddress, true)
      .then(loaded => {
        if (!loaded) return;

        Promise.all([
          DAOService.getNetworkParameter("councilAmount", network.networkAddress),
          DAOService.getNetworkParameter("disputableTime", network.networkAddress),
          DAOService.getNetworkParameter("draftTime", network.networkAddress),
          DAOService.getNetworkParameter("oracleExchangeRate", network.networkAddress),
          DAOService.getNetworkParameter("mergeCreatorFeeShare", network.networkAddress),
          DAOService.getNetworkParameter("proposerFeeShare", network.networkAddress),
          DAOService.getNetworkParameter("percentageNeededForDispute", network.networkAddress),
          DAOService.getTreasury(),
          DAOService.getSettlerTokenData(network.networkAddress),
          DAOService.getTotalSettlerLocked(network.networkAddress),
          0
        ])
        .then(([councilAmount, 
                disputableTime, 
                draftTime, 
                oracleExchangeRate, 
                mergeCreatorFeeShare,
                proposerFeeShare,
                percentageNeededForDispute, 
                treasury,
                networkToken,
                tokensLocked,
                tokensStaked]) => setForcedNetwork({
                  ...network,
                  councilAmount,
                  disputableTime: disputableTime / 1000,
                  draftTime: draftTime / 1000,
                  oracleExchangeRate,
                  mergeCreatorFeeShare,
                  proposerFeeShare,
                  percentageNeededForDispute,
                  treasury,
                  networkToken,
                  tokensLocked,
                  tokensStaked
                }));
      })
      .catch(error => console.log("Failed to Load Network", error));
  }, [network]);

  return(
    <>
      <Row className="mb-3">
        <h3 className="text-capitalize family-Regular text-white">{forcedNetwork?.name}</h3>
      </Row>

      <Row className="mb-4">
        <Col xs="auto">
          <Row className="mb-2">
            <span className="caption-small text-gray">Query URL</span>
          </Row>
          
          <Row className="mb-2">
            <span className="caption-large">
              <span className="text-white">{urlWithoutProtocol(apiUrl)}/</span>
              <span className="text-primary">
              {showTextOrDefault(getQueryableText(forcedNetwork?.name || ""),
                                 t("custom-network:steps.network-information.fields.name.default"))}
              </span>
            </span>
          </Row>

          <Row className="mb-2">
            <span className="caption-small text-gray">Creation Date</span>
          </Row>

          <Row>
            <span className="caption-large text-white">
              {forcedNetwork ? formatDate(forcedNetwork?.createdAt, "-") : ""}
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
            description=
              {`${t("misc.upload")} ${t("custom-network:steps.network-information.fields.full-logo.label")}`}
            lg
          />
        </Col>
      </Row>

      <Row>
        {networkAmounts.map(amount => 
          <Col xs={3}>
            <AmountCard {...amount} />
          </Col>)}
      </Row>
    </>
  );
}