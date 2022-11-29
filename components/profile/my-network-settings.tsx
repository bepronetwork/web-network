import {useEffect, useState} from "react";
import {Col, Row} from "react-bootstrap";

import {useTranslation} from "next-i18next";
import getConfig from "next/config";

import InfoIconEmpty from "assets/icons/info-icon-empty";
import LockedIcon from "assets/icons/locked-icon";

import Button from "components/button";
import ConnectGithub from "components/connect-github";
import AmountCard from "components/custom-network/amount-card";
import NetworkContractSettings from "components/custom-network/network-contract-settings";
import RepositoriesList from "components/custom-network/repositories-list";
import ThemeColors from "components/custom-network/theme-colors";
import TreasuryAddressField from "components/custom-network/treasury-address-field";
import ImageUploader from "components/image-uploader";
import InputNumber from "components/input-number";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";
import TokensSettings from "components/tokens-settings";
import {WarningSpan} from "components/warning-span";

import {useAppState} from "contexts/app-state";
import {useNetworkSettings} from "contexts/network-settings";
import {addToast, toastError, toastSuccess} from "contexts/reducers/change-toaster";

import {psReadAsText} from "helpers/file-reader";
import {formatDate} from "helpers/formatDate";
import {getQueryableText, urlWithoutProtocol} from "helpers/string";

import {MetamaskErrors} from "interfaces/enums/Errors";
import {Network} from "interfaces/network";
import {Token} from "interfaces/token";

import useApi from "x-hooks/use-api";
import {useAuthentication} from "x-hooks/use-authentication";
import useBepro from "x-hooks/use-bepro";
import {useNetwork} from "x-hooks/use-network";
import useNetworkTheme from "x-hooks/use-network-theme";

import RegistryGovernorSettings from "./registry-governor-settings";

interface MyNetworkSettingsProps {
  network: Network;
  updateEditingNetwork: () => void
}

const { publicRuntimeConfig } = getConfig();

export default function MyNetworkSettings({ network, updateEditingNetwork } : MyNetworkSettingsProps) {
  const { t } = useTranslation(["common", "custom-network"]);

  const [isClosing, setIsClosing] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isGovernorRegistry, setIsGovernorRegistry] = useState(false);
  const [errorBigImages, setErrorBigImages] = useState(false)
  const [isUpdating, setIsUpdating] = useState(false);

  const { state, dispatch } = useAppState();

  const { colorsToCSS } = useNetworkTheme();
  const { updateNetwork, processEvent } = useApi();
  const { handleChangeNetworkParameter, handleAddNetworkToRegistry } = useBepro();

  const { updateActiveNetwork } = useNetwork();
  const { updateWalletBalance } = useAuthentication();
  const { details, fields, github, settings, tokens, forcedNetwork, isAbleToClosed } = useNetworkSettings();

  const isCurrentNetwork = !!network && 
    !!state.Service?.network?.active && 
    network?.networkAddress === state.Service?.network?.active?.networkAddress;
    
  const networkNeedRegistration = network?.isRegistered === false;

  const handleColorChange = value => fields.colors.setter(value);
  
  const NetworkAmount = (title, description, amount) => ({ title, description, amount });

  const tvl = (+forcedNetwork?.tokensStaked || 0) + (+forcedNetwork?.tokensLocked || 0);

  const networkAmounts = [
    NetworkAmount(t("custom-network:tokens-staked", { symbol: forcedNetwork?.networkToken?.symbol }), 
                  t("custom-network:tokens-staked-description"), 
                  forcedNetwork?.tokensStaked || 0),
    NetworkAmount(t("custom-network:oracles-staked", { symbol: forcedNetwork?.networkToken?.symbol }), 
                  t("custom-network:oracles-staked-description"),
                  forcedNetwork?.tokensLocked || 0),
    NetworkAmount(t("custom-network:tvl"), t("custom-network:tvl-description"), tvl)
  ];

  const showTextOrDefault = (text: string, defaultText: string) => text?.trim() === "" ? defaultText : text;
  
  const handleIconChange = value => fields.logo.setter(value, "icon");
  const handleFullChange = value => fields.logo.setter(value, "full");

  async function handleSubmit() {
    if (
      !state.currentUser?.login ||
      !state.currentUser?.walletAddress || !state.Service?.active ||
      !forcedNetwork ||
      forcedNetwork?.isClosed ||
      errorBigImages
    )
      return;

    setIsUpdating(true);

    const json = {
      description: details?.description || "",
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
      creator: state.currentUser.walletAddress,
      githubLogin: state.currentUser.login,
      networkAddress: network.networkAddress,
      accessToken: state.currentUser.accessToken,
      allAllowedTokens: tokens?.allowedTransactions?.concat(tokens?.allowedRewards)
        .map((token) => token?.id)
        .filter((v) => v),
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
        } = settings;

        const networkAddress = network?.networkAddress;

        const promises = await Promise.allSettled([
          ... draftTime !== forcedNetwork.draftTime ? 
            [handleChangeNetworkParameter("draftTime", draftTime, networkAddress)] : [],
          ... disputableTime !== forcedNetwork.disputableTime ? 
            [handleChangeNetworkParameter("disputableTime", disputableTime, networkAddress)] : [],
          ... councilAmount !== +forcedNetwork.councilAmount ? 
            [handleChangeNetworkParameter("councilAmount", councilAmount, networkAddress)] : [],
          ... percentageForDispute !== forcedNetwork.percentageNeededForDispute ? 
            [handleChangeNetworkParameter("percentageNeededForDispute", percentageForDispute, networkAddress)] : []
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
        
        if (success.length){
          dispatch(toastSuccess(t("custom-network:messages.updated-parameters", { 
            updated: success.length, 
            total: promises.length 
          })));
          
          if(draftTime !== forcedNetwork.draftTime)
            Promise.all([
              await processEvent("bounty","update-draft-time", network.name),
              await processEvent("bounty","moved-to-open", network.name)
            ])
        }
          

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
      .finally(() => setIsUpdating(false));
  }

  function handleCloseNetwork() {
    if (!state.Service?.network?.active ||
      !state.currentUser?.login ||
      !state.currentUser?.accessToken ||
      !state.currentUser?.walletAddress ||
      !state.Service?.active) return;

    setIsClosing(true);

    state.Service?.active.unlockFromRegistry()
      .then(() => {
        return updateNetwork({
          githubLogin: state.currentUser.login,
          isClosed: true,
          creator: state.currentUser.walletAddress,
          networkAddress: network?.networkAddress,
          accessToken: state.currentUser?.accessToken
        });
      })
      .then(() => {
        updateWalletBalance(true);

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
    if (!network) return;

    setIsRegistering(true);

    handleAddNetworkToRegistry(network.networkAddress)
      .then(txInfo => {
        return processEvent("registry", "registered", network.name, { fromBlock: txInfo.blockNumber });
      })
      .then(() => {
        if (isCurrentNetwork) updateActiveNetwork(true);

        return updateEditingNetwork();
      })
      .catch(error => {
        if (error?.code !== MetamaskErrors.UserRejected)
          dispatch(addToast({
            type: "danger",
            title: t("actions.failed"),
            content: t("custom-network:errors.failed-to-create-network", { error })
          }));

        console.debug("Failed to add to registry", network.networkAddress, error);
      })
      .finally(() => setIsRegistering(false));
  }
  

  useEffect(() => {
    const logoSize = (details?.fullLogo?.value?.raw?.size || 0)/1024/1024
    const iconSize = (details?.iconLogo?.value?.raw?.size || 0)/1024/1024

    if(logoSize + iconSize >= 1){
      setErrorBigImages(true)
    }else {
      setErrorBigImages(false)
    }

  }, [details?.fullLogo, details?.iconLogo])

  useEffect(() => {
    if(!state.Service?.active || !state.currentUser?.walletAddress) return;

    state.Service?.active.isRegistryGovernor(state.currentUser?.walletAddress).then(setIsGovernorRegistry)
  }, [state.currentUser])

  function setCurrentSelectedTokens({transactional, reward}: {
    transactional: Token[],
    reward: Token[]
  }) {
    fields.allowedTransactions.setter(transactional)
    fields.allowedRewards.setter(reward)
  }

  return (
    <ReadOnlyButtonWrapper>
      { isCurrentNetwork && <style>{colorsToCSS(settings?.theme?.colors)}</style> }
      {isGovernorRegistry && <RegistryGovernorSettings />}
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
              disabled={!state.currentUser?.walletAddress || !state.currentUser?.accessToken || isRegistering}
              withLockIcon={!state.currentUser?.walletAddress || !state.currentUser?.accessToken}
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
            disabled={!isAbleToClosed || isClosing || !state.currentUser?.login}
            className="ml-2"
            onClick={handleCloseNetwork}
          >
            {(!isAbleToClosed || !state.currentUser?.login) && <LockedIcon className="me-2" />}
            <span>{t("custom-network:close-network")}</span>
            {isClosing ? (
              <span className="spinner-border spinner-border-xs ml-1" />
            ) : (
              ""
            )}
          </Button>
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
        {networkAmounts.map(amount => 
          <Col xs={3} key={amount.title}>
            <AmountCard {...amount} />
          </Col>)}
      </Row>
      
      <Row className="mt-4">
        <span className="caption-medium text-white mb-3">{t("custom-network:steps.repositories.label")}</span>

        { !state.currentUser?.login &&
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
          {t("custom-network:network-info")}
        </span>
        <Col>
          <label className="caption-small mb-2">
            {t("custom-network:network-address")}
          </label>
          <input
              type="text"
              className="form-control"
              value={network?.networkAddress}
              disabled={true}
            />
        </Col>
    </Row>
      <Row className="mt-4">
        <span className="caption-medium text-white mb-3">
          {t("custom-network:steps.network-settings.fields.fees.title")}
        </span>
        <Col>
          <InputNumber
            disabled={true}
            label={t("custom-network:steps.treasury.fields.cancel-fee.label")}
            symbol="%"
            value={settings?.treasury?.cancelFee?.value}
            thousandSeparator
          />
        </Col>

        <Col>
          <InputNumber
            disabled={true}
            label={t("custom-network:steps.treasury.fields.close-fee.label")}
            symbol="%"
            value={settings?.treasury?.closeFee?.value}
            thousandSeparator
          />
        </Col>

        <Col xs={6}>
            <TreasuryAddressField
              value={settings?.treasury?.address?.value}
              onChange={fields.treasury.setter}
              validated={settings?.treasury?.address?.validated}
              disabled={true}
            />
          </Col>
    </Row>
      <Row>
      <WarningSpan
              text={t("custom-network:steps.network-settings.fields.other-settings.warning-registry")}
            />
      </Row>
      <Row className="mt-4">
        <TokensSettings setCurrentSelectedTokens={setCurrentSelectedTokens} defaultSelectedTokens={network?.tokens}/>
      </Row>
      <Row className="mt-4">
        <span className="caption-medium text-white mb-3">
          {t("custom-network:steps.network-settings.fields.other-settings.title")}
        </span>
      
        <NetworkContractSettings />
      </Row>

      {(settings?.validated && github?.validated && !network?.isClosed && !networkNeedRegistration) &&
        <Row className="mt-1 mb-5">
          <Col>
            <Button onClick={handleSubmit} disabled={isUpdating}>
              <span>{t("custom-network:save-settings")}</span>
              {isUpdating ? (
                <span className="spinner-border spinner-border-xs ml-1" />
              ) : (
                ""
              )}
            </Button>
          </Col>
        </Row>
      }
  </ReadOnlyButtonWrapper>
  );
}