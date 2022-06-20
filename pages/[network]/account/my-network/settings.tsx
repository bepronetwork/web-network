import { useContext, useEffect, useState } from "react";

import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import getConfig from "next/config";
import { useRouter } from "next/router";

import LockedIcon from "assets/icons/locked-icon";

import Button from "components/button";
import ConnectWalletButton from "components/connect-wallet-button";
import CustomContainer from "components/custom-container";
import AmountCard from "components/custom-network/amount-card";
import RepositoriesList from "components/custom-network/repositories-list";
import ThemeColors from "components/custom-network/theme-colors";
import ImageUploader from "components/image-uploader";
import InputNumber from "components/input-number";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";
import { useNetworkSettings } from "contexts/network-settings";
import { addToast } from "contexts/reducers/add-toast";

import { handleNetworkAddress } from "helpers/custom-network";
import { psReadAsText } from "helpers/file-reader";
import { formatDate } from "helpers/formatDate";
import { formatNumberToCurrency } from "helpers/formatNumber";
import { getQueryableText, urlWithoutProtocol } from "helpers/string";

import useApi from "x-hooks/use-api";
import useNetworkTheme from "x-hooks/use-network";

const { publicRuntimeConfig } = getConfig();

const MAX_PERCENTAGE_FOR_DISPUTE = +publicRuntimeConfig?.networkConfig?.disputesPercentage;
const MIN_DRAFT_TIME = +publicRuntimeConfig?.networkConfig?.reedemTime?.min;
const MAX_DRAFT_TIME = +publicRuntimeConfig?.networkConfig?.reedemTime?.max;
const MIN_DISPUTE_TIME = +publicRuntimeConfig?.networkConfig?.disputableTime?.min;
const MAX_DISPUTE_TIME = +publicRuntimeConfig?.networkConfig?.disputableTime?.max;
const MIN_COUNCIL_AMOUNT = +publicRuntimeConfig?.networkConfig?.councilAmount?.min;
const MAX_COUNCIL_AMOUNT = +publicRuntimeConfig?.networkConfig?.councilAmount?.max;
interface NetworkAmounts {
  tokenStaked: number;
  oraclesStaked: number;
}

export default function Settings() {
  const router = useRouter();
  const { t } = useTranslation(["common", "custom-network"]);

  const [isClosing, setIsClosing] = useState(false);
  const [isAbleToClose, setIsAbleToClose] = useState(false);

  const [networkAmounts, setNetworkAmounts] = useState<NetworkAmounts>({
    tokenStaked: 0,
    oraclesStaked: 0
  });

  const [updatingNetwork, setUpdatingNetwork] = useState(false);

  const { service: DAOService } = useDAO();
  const { updateNetwork, isNetworkOwner } = useApi();
  const { activeNetwork, updateActiveNetwork } = useNetwork();
  const { colorsToCSS, getURLWithNetwork } = useNetworkTheme();
  const { wallet, user, updateWalletBalance } = useAuthentication();
  const { details, github, parameters, fields } = useNetworkSettings();

  const { dispatch } = useContext(ApplicationContext);

  const networkTokenSymbol = activeNetwork?.networkToken?.symbol || t("misc.$token");
  const settingsValidated = [
    fields.description.validator(details?.description),
    fields.colors.validator(details?.theme?.colors),
    fields.repository.validator(github?.repositories),
    parameters?.draftTime?.validated,
    parameters?.disputableTime?.validated,
    parameters?.percentageNeededForDispute?.validated,
    parameters?.councilAmount?.validated
  ].every(condition => condition);

  function showTextOrDefault(text: string, defaultText: string) {
    return text?.trim() === "" ? defaultText : text;
  }

  async function loadAmounts(networkArg) {
    try {
      const tokenStaked = 0;
      const oraclesStaked = await DAOService.getTotalSettlerLocked(handleNetworkAddress(networkArg));

      setNetworkAmounts({
        tokenStaked,
        oraclesStaked
      });
    } catch (error) {
      console.log("Failed to get network amounts", error);
    }
  }

  async function handleSubmit() {
    if (!user?.login || !wallet?.address || !DAOService || !activeNetwork) return;

    setUpdatingNetwork(true);

    const json = {
      description: details.description,
      colors: JSON.stringify(details.theme.colors),
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
      networkAddress: activeNetwork.networkAddress,
      accessToken: user.accessToken
    };

    updateNetwork(json)
      .then(async () => {
        if (activeNetwork.draftTime !== parameters.draftTime.value)
          await DAOService.setNetworkParameter("draftTime", parameters.draftTime.value).catch(console.log);

        if (activeNetwork.disputableTime !== parameters.disputableTime.value)
          await DAOService.setNetworkParameter("disputableTime", parameters.disputableTime.value).catch(console.log);

        if (activeNetwork.councilAmount !== parameters.councilAmount.value)
          await DAOService.setNetworkParameter("councilAmount", parameters.councilAmount.value).catch(console.log);

        if (activeNetwork.percentageNeededForDispute !== parameters.percentageNeededForDispute.value)
          await DAOService.setNetworkParameter("percentageNeededForDispute", 
                                               parameters.percentageNeededForDispute.value)
          .catch(console.log);

        dispatch(addToast({
            type: "success",
            title: t("actions.success"),
            content: t("custom-network:messages.refresh-the-page")
        }));

        setUpdatingNetwork(false);

        updateActiveNetwork(true);
      })
      .catch((error) => {
        dispatch(addToast({
            type: "danger",
            title: t("actions.failed"),
            content: t("custom-network:errors.failed-to-update-network", {
              error
            })
        }));

        setUpdatingNetwork(false);
        console.log(error);
      });
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
          networkAddress: activeNetwork.networkAddress,
          accessToken: user?.accessToken
        });
      })
      .then(() => {
        dispatch(addToast({
          type: "success",
          title: t("actions.success"),
          content: t("custom-network:messages.network-closed")
        }));
        
        updateActiveNetwork(true);
        updateWalletBalance();

        router.push(getURLWithNetwork("/account/my-network"));
      })
      .catch((error) => {
        dispatch(addToast({
            type: "danger",
            title: t("actions.failed"),
            content: t("custom-network:errors.failed-to-close-network", {
              error
            })
        }));
      })
      .finally(() => {
        setIsClosing(false);
      });
  }

  function handleIconChange(value) {
    fields.logo.setter(value, "icon");
  }

  function handleFullChange(value) {
    fields.logo.setter(value, "full");
  }

  function handleDescriptionChange(e) {
    fields.description.setter(e.target.value);
  }

  function handleColorChange(value) {
    fields.colors.setter(value);
  }

  function handleRepositoryCheck(fullName: string) {
    fields.repository.setter(fullName);
  }

  function handleDisputableTimeChange({ floatValue }) {
    fields.parameter.setter({
      label: "disputableTime", 
      value: floatValue
    });
  }

  function handlePercentageNeededForDisputeChange({ floatValue }) {
    fields.parameter.setter({
      label: "percentageNeededForDispute", 
      value: floatValue
    });
  }

  function handleDraftTimeChange({ floatValue }) {
    fields.parameter.setter({
      label: "draftTime", 
      value: floatValue
    });
  }

  function handleCouncilAmountChange({ floatValue }) {
    fields.parameter.setter({
      label: "councilAmount", 
      value: floatValue
    });
  }

  useEffect(() => {
    if (!DAOService || !activeNetwork || !wallet?.address || !user?.login) return;

    DAOService.isNetworkAbleToClosed()
      .then((result) => {
        setIsAbleToClose(result && !activeNetwork?.isClosed);
      })
      .catch(console.log);

    isNetworkOwner(wallet?.address, activeNetwork?.networkAddress)
      .then((result) => {
        if (!result) router.push(getURLWithNetwork("/account"));
        else {
          loadAmounts(activeNetwork);
        }
      })
      .catch((error) => {
        console.log("Failed to verify network creator", error);

        router.push(getURLWithNetwork("/account"));
      });
  }, [DAOService, activeNetwork, wallet?.address, user?.login]);

  return (
    <div>
      <style>{colorsToCSS(details?.theme?.colors)}</style>

      <ConnectWalletButton asModal={true} />

      <CustomContainer>
        <div className="row mt-5 pt-5 justify-content-center align-items-center">
          <div className="col-11">
            <div className="d-flex flex-row gap-20">
              <div className="d-flex flex-column justify-content-center">
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
              </div>

              <div className="d-flex flex-column justify-content-center">
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
              </div>

              <div className="d-flex flex-column justify-content-center">
                <p className="h3 text-white mb-3 text-capitalize">
                  {showTextOrDefault(activeNetwork?.name,
                                     t("custom-network:steps.network-information.fields.name.default"))}
                </p>

                <p className="caption-small text-ligth-gray mb-1">
                  {t("custom-network:query-url")}
                </p>
                <p className="caption-small text-gray mb-3">
                  {urlWithoutProtocol(publicRuntimeConfig?.apiUrl)}/
                  <span className="text-primary">
                    {showTextOrDefault(getQueryableText(activeNetwork?.name || ""),
                                       t("custom-network:steps.network-information.fields.name.default"))}
                  </span>
                </p>

                <div className="d-flex flex-row">
                  <div className="d-flex flex-column mr-3">
                    <span className="text-ligth-gray mb-1 caption-small">
                      {t("misc.creation-date")}
                    </span>
                    <span className="text-gray caption-small">
                      {activeNetwork?.createdAt
                        ? formatDate(activeNetwork?.createdAt, "-")
                        : ""}
                    </span>
                  </div>

                  <Button
                    color="dark-gray"
                    disabled={!isAbleToClose || isClosing}
                    className="ml-2"
                    onClick={handleCloseNetwork}
                  >
                    {!isAbleToClose && <LockedIcon className="me-2" />}
                    <span>{t("custom-network:close-network")}</span>
                    {isClosing ? (
                      <span className="spinner-border spinner-border-xs ml-1" />
                    ) : (
                      ""
                    )}
                  </Button>
                </div>
              </div>
            </div>

            <div className="row mt-4">
              <div className="col-4">
                <AmountCard
                  title={t("custom-network:tokens-staked")}
                  description={t("custom-network:tokens-staked-description")}
                  currency="token"
                  amount={networkAmounts.tokenStaked}
                />
              </div>

              <div className="col-4">
                <AmountCard
                  title={t("custom-network:oracles-staked")}
                  description={t("custom-network:oracles-staked-description")}
                  currency="oracles"
                  amount={networkAmounts.oraclesStaked}
                />
              </div>

              <div className="col-4">
                <AmountCard
                  title={t("custom-network:tvl")}
                  description={t("custom-network:tvl-description")}
                  amount={
                    networkAmounts.tokenStaked + networkAmounts.oraclesStaked
                  }
                />
              </div>
            </div>

            <div className="row mx-0 mt-4 p-20 border-radius-8 bg-shadow">
              <span className="caption-medium text-white mb-4">
                {t("custom-network:network-settings")}
              </span>

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
                    className={`form-control ${
                      fields.description.validator(details?.description) ? "" : "is-invalid"
                    }`}
                    value={details?.description}
                    onChange={handleDescriptionChange}
                  ></textarea>
                </div>
              </div>

              <RepositoriesList
                repositories={github.repositories}
                onClick={handleRepositoryCheck}
              />

              <ThemeColors
                colors={details?.theme?.colors}
                similar={details?.theme?.similar}
                setColor={handleColorChange}
              />

              <div className="row px-0 mt-3">
                <div className="col-3">
                  <InputNumber
                    classSymbol={"text-ligth-gray"}
                    label={t("custom-network:dispute-time")}
                    symbol={t("misc.seconds")}
                    max={MAX_DISPUTE_TIME}
                    description={t("custom-network:errors.dispute-time", {
                      min: MIN_DISPUTE_TIME,
                      max: formatNumberToCurrency(MAX_DISPUTE_TIME, 0)
                    })}
                    value={parameters?.disputableTime?.value}
                    error={parameters?.disputableTime?.validated === false}
                    min={0}
                    placeholder={"0"}
                    thousandSeparator
                    decimalSeparator="."
                    decimalScale={18}
                    onValueChange={handleDisputableTimeChange}
                  />
                </div>

                <div className="col-3">
                  <InputNumber
                    classSymbol={"text-ligth-gray"}
                    label={t("custom-network:percentage-for-dispute")}
                    max={MAX_PERCENTAGE_FOR_DISPUTE}
                    description={t("custom-network:errors.percentage-for-dispute",
                      {max: MAX_PERCENTAGE_FOR_DISPUTE })}
                    symbol="%"
                    value={parameters?.percentageNeededForDispute?.value}
                    error={parameters?.percentageNeededForDispute?.validated === false}
                    placeholder={"0"}
                    thousandSeparator
                    decimalSeparator="."
                    decimalScale={18}
                    onValueChange={handlePercentageNeededForDisputeChange}
                  />
                </div>

                <div className="col-3">
                  <InputNumber
                    classSymbol={"text-ligth-gray"}
                    label={t("custom-network:redeem-time")}
                    max={MAX_DRAFT_TIME}
                    description={t("custom-network:errors.redeem-time", {
                      min: MIN_DRAFT_TIME,
                      max: formatNumberToCurrency(MAX_DRAFT_TIME, 0)
                    })}
                    symbol="seconds"
                    value={parameters?.draftTime?.value}
                    error={parameters?.draftTime?.validated === false}
                    min={0}
                    placeholder={"0"}
                    thousandSeparator
                    decimalSeparator="."
                    decimalScale={18}
                    onValueChange={handleDraftTimeChange}
                  />
                </div>

                <div className="col-3">
                  <InputNumber
                    classSymbol={"text-primary"}
                    label={t("custom-network:council-amount")}
                    symbol={networkTokenSymbol}
                    max={MAX_COUNCIL_AMOUNT}
                    description={t("custom-network:errors.council-amount", {
                      token: networkTokenSymbol,
                      min: formatNumberToCurrency(MIN_COUNCIL_AMOUNT, 0),
                      max: formatNumberToCurrency(MAX_COUNCIL_AMOUNT, 0)
                    })}
                    value={parameters?.councilAmount?.value}
                    error={parameters?.councilAmount?.validated === false}
                   min={0}
                    placeholder={"0"}
                    thousandSeparator
                    decimalSeparator="."
                    decimalScale={18}
                    onValueChange={handleCouncilAmountChange}
                  />
                </div>
              </div>
            </div>

            {(settingsValidated && !activeNetwork?.isClosed && (
              <div className="d-flex flex-row justify-content-center mt-3 mb-2">
                <Button onClick={handleSubmit} disabled={updatingNetwork}>
                  <span>{t("custom-network:save-settings")}</span>
                  {updatingNetwork ? (
                    <span className="spinner-border spinner-border-xs ml-1" />
                  ) : (
                    ""
                  )}
                </Button>
              </div>
            )) ||
              ""}
          </div>
        </div>
      </CustomContainer>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "connect-wallet-button",
        "my-oracles",
        "bounty",
        "pull-request",
        "custom-network"
      ]))
    }
  };
};
