import { useEffect } from "react";
import { Col, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";
import getConfig from "next/config";

import ConnectGithub from "components/connect-github";
import AmountCard from "components/custom-network/amount-card";
import NetworkContractSettings from "components/custom-network/network-contract-settings";
import NetworkParameterInput from "components/custom-network/network-parameter-input";
import RepositoriesList from "components/custom-network/repositories-list";
import ThemeColors from "components/custom-network/theme-colors";
import TreasuryAddressField from "components/custom-network/treasury-address-field";
import ImageUploader from "components/image-uploader";

import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";
import { useNetworkSettings } from "contexts/network-settings";

import { formatDate } from "helpers/formatDate";
import { getQueryableText, urlWithoutProtocol } from "helpers/string";

import { Network } from "interfaces/network";

import useNetworkTheme from "x-hooks/use-network";

interface MyNetworkSettingsProps {
  network: Network;
}

const { publicRuntimeConfig: { apiUrl } } = getConfig();

export default function MyNetworkSettings({ network } : MyNetworkSettingsProps) {
  const { t } = useTranslation(["common", "custom-network"]);

  const { user } = useAuthentication();
  const { activeNetwork } = useNetwork();
  const { service: DAOService } = useDAO();
  const { colorsToCSS } = useNetworkTheme();
  const { details, fields, github, settings, forcedNetwork, setForcedNetwork } = useNetworkSettings();

  const isCurrentNetwork = 
    !!forcedNetwork && !!activeNetwork && forcedNetwork?.networkAddress === activeNetwork?.networkAddress;

  const handleColorChange = value => fields.colors.setter(value);
  
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
      { isCurrentNetwork && <style>{colorsToCSS(settings?.theme?.colors)}</style> }
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
          <Col xs={3} key={amount.title}>
            <AmountCard {...amount} />
          </Col>)}
      </Row>
      
      <Row className="mt-4">
        <span className="caption-medium text-white mb-3">Repositories</span>

        { !user?.login &&
          <ConnectGithub /> || 
          <RepositoriesList
            repositories={github.repositories}
            onClick={fields.repository.setter}
            withLabel={false}
          />
        }
      </Row>

      <Row className="mt-4">
        <Col>
          <span className="caption-medium text-white mb-3">Network Colours</span>

          <ThemeColors
            colors={settings?.theme?.colors}
            similar={settings?.theme?.similar}
            setColor={handleColorChange}
          />
        </Col>
      </Row>

      <Row className="mt-4">
        <span className="caption-medium text-white mb-3">
          {t("custom-network:steps.network-settings.fields.fees.title")}
        </span>

        <Col xs={8}>
          <TreasuryAddressField
            value={settings?.treasury?.address?.value}
            onChange={fields.treasury.setter}
            validated={settings?.treasury?.address?.validated}
          />
        </Col>

        <Col>
          <NetworkParameterInput
            label={t("custom-network:steps.treasury.fields.cancel-fee.label")}
            symbol="%"
            value={settings?.treasury?.cancelFee?.value}
            error={settings?.treasury?.cancelFee?.validated === false}
            onChange={fields.cancelFee.setter}
          />
        </Col>

        <Col>
          <NetworkParameterInput
            label={t("custom-network:steps.treasury.fields.close-fee.label")}
            symbol="%"
            value={settings?.treasury?.closeFee?.value}
            error={settings?.treasury?.closeFee?.validated === false}
            onChange={fields.closeFee.setter}
          />
        </Col>
      </Row>

      <Row className="mt-4">
        <span className="caption-medium text-white mb-3">
          {t("custom-network:steps.network-settings.fields.other-settings.title")}
        </span>
      
        <NetworkContractSettings />
      </Row>
    </>
  );
}