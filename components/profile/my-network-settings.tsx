import { useContext, useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";
import getConfig from "next/config";

import InfoIconEmpty from "assets/icons/info-icon-empty";
import LockedIcon from "assets/icons/locked-icon";

import Button from "components/button";
import ConnectGithub from "components/connect-github";
import AmountCard from "components/custom-network/amount-card";
import NetworkContractSettings from "components/custom-network/network-contract-settings";
import NetworkParameterInput from "components/custom-network/network-parameter-input";
import RepositoriesList from "components/custom-network/repositories-list";
import ThemeColors from "components/custom-network/theme-colors";
import TreasuryAddressField from "components/custom-network/treasury-address-field";
import ImageUploader from "components/image-uploader";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";
import { useNetworkSettings } from "contexts/network-settings";
import { addToast, toastError, toastSuccess } from "contexts/reducers/add-toast";

import { psReadAsText } from "helpers/file-reader";
import { formatDate } from "helpers/formatDate";
import { getQueryableText, urlWithoutProtocol } from "helpers/string";

import { Network } from "interfaces/network";

import DAO from "services/dao-service";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import useNetworkTheme from "x-hooks/use-network";

interface MyNetworkSettingsProps {
  network: Network;
  updateEditingNetwork: () => void
}

const { publicRuntimeConfig } = getConfig();

export default function MyNetworkSettings({ network, updateEditingNetwork } : MyNetworkSettingsProps) {
  const { t } = useTranslation(["common", "custom-network"]);

  const [isClosing, setIsClosing] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAbleToBeClosed, setIsAbleToBeClosed] = useState(false);
  const [updatingNetwork, setUpdatingNetwork] = useState(false);

  const { service: DAOService } = useDAO();
  const { colorsToCSS } = useNetworkTheme();
  const { updateNetwork, registerNetwork } = useApi();
  const { handleChangeNetworkParameter } = useBepro();
  const { dispatch } = useContext(ApplicationContext);
  const { activeNetwork, updateActiveNetwork } = useNetwork();
  const { user, wallet, updateWalletBalance } = useAuthentication();
  const { details, fields, github, settings, forcedNetwork, setForcedNetwork } = useNetworkSettings();

  const isCurrentNetwork = !!network && !!activeNetwork && network?.networkAddress === activeNetwork?.networkAddress;
  const networkNeedRegistration = network?.isRegistered === false;

  const settingsValidated = [
    fields.description.validator(details?.description),
    fields.colors.validator(settings?.theme?.colors),
    fields.repository.validator(github?.repositories),
    settings?.parameters?.draftTime?.validated,
    settings?.parameters?.disputableTime?.validated,
    settings?.parameters?.percentageNeededForDispute?.validated,
    settings?.parameters?.councilAmount?.validated
  ].every(condition => condition);

  const handleColorChange = value => fields.colors.setter(value);
  
  const NetworkAmount = (title, description, amount) => ({ title, description, amount });

  const tvl = (forcedNetwork?.tokensStaked || 0) + (forcedNetwork?.tokensLocked || 0);

  const networkAmounts = [
    NetworkAmount(t("custom-network:tokens-staked", { symbol: forcedNetwork?.networkToken?.symbol }), 
                  t("custom-network:tokens-staked-description"), 
                  forcedNetwork?.tokensStaked || 0),
    NetworkAmount(t("custom-network:oracles-staked", { symbol: forcedNetwork?.networkToken?.symbol }), 
                  t("custom-network:oracles-staked-description"),
                  forcedNetwork?.tokensLocked || 0),
    NetworkAmount(t("custom-network:tvl"),  t("custom-network:tvl-description"), tvl)
  ];

  const showTextOrDefault = (text: string, defaultText: string) => text?.trim() === "" ? defaultText : text;
  
  const handleIconChange = value => fields.logo.setter(value, "icon");
  const handleFullChange = value => fields.logo.setter(value, "full");

  async function handleSubmit() {
    if (!user?.login || !wallet?.address || !DAOService || !forcedNetwork) return;

    setUpdatingNetwork(true);

    const json = {
      description: details.description,
      colors: JSON.stringify(settings.theme.colors),
      logoIcon: details.iconLogo.value.raw ? await psReadAsText(details.iconLogo.value.raw) : undefined,
      fullLogo: details.fullLogo.value.raw ? await psReadAsText(details.fullLogo.value.raw) : undefined,
      repositoriesToAdd: 
        JSON.stringify(github.repositories
          .filter((repo) => repo.checked && !repo.isSaved)
          .map(({ name, fullName }) => ({ name, fullName }))),
      repositoriesToRemove: 
        JSON.stringify(github.repositories
          .filter((repo) => !repo.checked && repo.isSaved)
          .map(({ name, fullName }) => ({ name, fullName }))),
      creator: wallet.address,
      githubLogin: user.login,
      networkAddress: network.networkAddress,
      accessToken: user.accessToken
    };

    updateNetwork(json)
      .then(async () => {
        const {
          parameters: {
            draftTime: { value: draftTime },
            disputableTime: { value: disputableTime },
            councilAmount: { value: councilAmount },
            percentageNeededForDispute: { value: percentageForDispute },
          },
          treasury: {
            address: { value: treasury },
            cancelFee: { value: cancelFee },
            // closeFee: { value: closeFee },
          }
        } = settings;

        const networkAddress = network?.networkAddress;

        const promises = await Promise.allSettled([
          ... draftTime !== forcedNetwork.draftTime ? 
            [handleChangeNetworkParameter("draftTime", draftTime, networkAddress)] : [],
          ... disputableTime !== forcedNetwork.disputableTime ? 
            [handleChangeNetworkParameter("disputableTime", disputableTime, networkAddress)] : [],
          ... councilAmount !== forcedNetwork.councilAmount ? 
            [handleChangeNetworkParameter("councilAmount", councilAmount, networkAddress)] : [],
          ... percentageForDispute !== forcedNetwork.percentageNeededForDispute ? 
            [handleChangeNetworkParameter("percentageNeededForDispute", percentageForDispute, networkAddress)] : [],
          ... treasury !== forcedNetwork.treasury.treasury ? 
            [handleChangeNetworkParameter("treasury", treasury, networkAddress)] : [],
          ... cancelFee !== forcedNetwork.treasury.cancelFee ? 
            [handleChangeNetworkParameter("cancelFee", cancelFee, networkAddress)] : [],
          // ... closeFee !== forcedNetwork.treasury.closeFee ? [handleChangeNetworkParameter("closeFee", closeFee, networkAddress)] : [],
        ]);

        const failed = [];
        const success = [];

        promises.forEach(promise => {
          if (promise.status === "fulfilled") success.push(promise.value);
          else failed.push(promise.reason);
        });

        if (failed.length) {
          dispatch(toastError(t("custom-network:errors.updated-parameters", {
            failed: failed.length
          }), t("custom-network:errors.updating-values")));
          console.error(failed);
        }
        
        if (success.length)
          dispatch(toastSuccess(t("custom-network:messages.updated-parameters", { 
            updated: success.length, 
            total: promises.length 
          })));

        if (isCurrentNetwork) updateActiveNetwork(true);

        return updateEditingNetwork();
      })
      .then(() => {
        dispatch(toastSuccess(t("custom-network:messages.refresh-the-page"), t("actions.success")));
      })
      .catch((error) => {
        dispatch(toastError(t("custom-network:errors.failed-to-update-network", { error }), t("actions.failed")));
        
        console.log(error);
      })
      .finally(() => setUpdatingNetwork(false));
  }

  function handleCloseNetwork() {
    if (!activeNetwork || !user?.login || !user?.accessToken || !wallet?.address || !DAOService) return;

    setIsClosing(true);

    DAOService.unlockFromRegistry()
      .then(() => {
        return updateNetwork({
          githubLogin: user.login,
          isClosed: true,
          creator: wallet.address,
          networkAddress: network?.networkAddress,
          accessToken: user?.accessToken
        });
      })
      .then(() => {
        updateWalletBalance();

        if (isCurrentNetwork) updateActiveNetwork(true);

        return updateEditingNetwork();
      })
      .then(() => dispatch(toastSuccess(t("custom-network:messages.network-closed"), t("actions.success"))))
      .catch(error => 
        dispatch(toastError(t("custom-network:errors.failed-to-close-network", { error }), t("actions.failed"))))
      .finally(() => {
        setIsClosing(false);
      });
  }

  function handleRegisterNetwork() {
    setIsRegistering(true);
    registerNetwork({
      creator: wallet.address
    })
      .then(() => {
        if (isCurrentNetwork) updateActiveNetwork(true);

        return updateEditingNetwork();
      })
      .catch(error => {
        dispatch(addToast({
            type: "danger",
            title: t("actions.failed"),
            content: t("custom-network:errors.failed-to-create-network", {
              error,
            }),
        }));

        console.debug("Failed register network", error);
      }).finally(() => setIsRegistering(false));
  }
  
  useEffect(() => {
    if (!network?.networkAddress) return;

    try {
      const dao = new DAO({
        web3Connection: DAOService.web3Connection,
        skipWindowAssignment: true
      });

      dao.loadNetwork(network.networkAddress)
      .then(loaded => {
        if (!loaded) return;

        Promise.all([
          dao.getNetworkParameter("councilAmount"),
          dao.getNetworkParameter("disputableTime"),
          dao.getNetworkParameter("draftTime"),
          dao.getNetworkParameter("oracleExchangeRate"),
          dao.getNetworkParameter("mergeCreatorFeeShare"),
          dao.getNetworkParameter("proposerFeeShare"),
          dao.getNetworkParameter("percentageNeededForDispute"),
          dao.getTreasury(),
          dao.getSettlerTokenData(),
          dao.getTotalNetworkToken(),
          dao.isNetworkAbleToBeClosed(),
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
                isNetworkAbleToBeClosed,
                tokensStaked]) => {
          setForcedNetwork({
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
          });

          setIsAbleToBeClosed(isNetworkAbleToBeClosed);
        });
      });
    } catch (error) {
      console.log("Failed to load network data", error, network);
    }
  }, [network?.networkAddress]);

  return(
    <>
      { isCurrentNetwork && <style>{colorsToCSS(settings?.theme?.colors)}</style> }
      { networkNeedRegistration && 
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
              disabled={!wallet?.address || !user?.accessToken || isRegistering}
              withLockIcon={!wallet?.address || !user?.accessToken}
              isLoading={isRegistering}
            >
              {t("actions.register")}
            </Button>
          </Col>
        </Row> 
      }
      <Row className="mb-3">
        <h3 className="text-capitalize family-Regular text-white">{network?.name}</h3>
      </Row>

      <Row className="mb-4 align-items-end">
        <Col xs="auto">
          <Row className="mb-2">
            <span className="caption-small text-gray">{t("custom-network:query-url")}</span>
          </Row>
          
          <Row className="mb-2">
            <span className="caption-large">
              <span className="text-white">{urlWithoutProtocol(publicRuntimeConfig?.urls?.api)}/</span>
              <span className="text-primary">
              {showTextOrDefault(getQueryableText(network?.name || ""),
                                 t("custom-network:steps.network-information.fields.name.default"))}
              </span>
            </span>
          </Row>

          <Row className="mb-2">
            <span className="caption-small text-gray">{t("misc.creation-date")}</span>
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
            description=
              {`${t("misc.upload")} ${t("custom-network:steps.network-information.fields.full-logo.label")}`}
            lg
          />
        </Col>

        <Col xs="auto">
          <Button
            color="dark-gray"
            disabled={!isAbleToBeClosed || isClosing || !user?.login}
            className="ml-2"
            onClick={handleCloseNetwork}
          >
            {(!isAbleToBeClosed || !user?.login) && <LockedIcon className="me-2" />}
            <span>{t("custom-network:close-network")}</span>
            {isClosing ? (
              <span className="spinner-border spinner-border-xs ml-1" />
            ) : (
              ""
            )}
          </Button>
        </Col>
      </Row>

      <Row>
        {networkAmounts.map(amount => 
          <Col xs={3} key={amount.title}>
            <AmountCard {...amount} />
          </Col>)}
      </Row>
      
      <Row className="mt-4">
        <span className="caption-medium text-white mb-3">{t("custom-network:steps.repositories.label")}</span>

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

      {(settingsValidated && !network?.isClosed && !networkNeedRegistration) &&
        <Row className="mt-1 mb-5">
          <Col>
            <Button onClick={handleSubmit} disabled={updatingNetwork}>
              <span>{t("custom-network:save-settings")}</span>
              {updatingNetwork ? (
                <span className="spinner-border spinner-border-xs ml-1" />
              ) : (
                ""
              )}
            </Button>
          </Col>
        </Row>
      }
    </>
  );
}