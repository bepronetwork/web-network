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
import NetworkContractSettings from "components/custom-network/network-contract-settings";
import RepositoriesList from "components/custom-network/repositories-list";
import ThemeColors from "components/custom-network/theme-colors";
import ImageUploader from "components/image-uploader";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";
import { useNetworkSettings } from "contexts/network-settings";
import { addToast } from "contexts/reducers/add-toast";

import { handleNetworkAddress } from "helpers/custom-network";
import { psReadAsText } from "helpers/file-reader";
import { formatDate } from "helpers/formatDate";
import { getQueryableText, urlWithoutProtocol } from "helpers/string";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import useNetworkTheme from "x-hooks/use-network";

const { publicRuntimeConfig } = getConfig();

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
  const { handleChangeNetworkParameter } = useBepro();
  const { activeNetwork, updateActiveNetwork } = useNetwork();
  const { colorsToCSS, getURLWithNetwork } = useNetworkTheme();
  const { wallet, user, updateWalletBalance } = useAuthentication();
  const { details, github, settings, fields } = useNetworkSettings();

  const { dispatch } = useContext(ApplicationContext);

  const settingsValidated = [
    fields.description.validator(details?.description),
    fields.colors.validator(settings?.theme?.colors),
    fields.repository.validator(github?.repositories),
    settings?.parameters?.draftTime?.validated,
    settings?.parameters?.disputableTime?.validated,
    settings?.parameters?.percentageNeededForDispute?.validated,
    settings?.parameters?.councilAmount?.validated
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
      networkAddress: activeNetwork.networkAddress,
      accessToken: user.accessToken
    };

    updateNetwork(json)
      .then(async () => {
        const draftTime = settings.parameters.draftTime.value;
        const disputableTime = settings.parameters.disputableTime.value;
        const councilAmount = settings.parameters.councilAmount.value;
        const percentageNeededForDispute = settings.parameters.percentageNeededForDispute.value;

        if (activeNetwork.draftTime !== draftTime)
          await handleChangeNetworkParameter("draftTime", draftTime).catch(console.log);

        if (activeNetwork.disputableTime !== disputableTime)
          await handleChangeNetworkParameter("disputableTime", disputableTime).catch(console.log);

        if (activeNetwork.councilAmount !== councilAmount)
          await handleChangeNetworkParameter("councilAmount", councilAmount).catch(console.log);

        if (activeNetwork.percentageNeededForDispute !== percentageNeededForDispute)
          await handleChangeNetworkParameter("percentageNeededForDispute", percentageNeededForDispute)
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


  useEffect(() => {
    if (!DAOService ||
        !activeNetwork || 
        !wallet?.address || 
        !user?.login || 
        activeNetwork?.name !== router?.query?.network) return;

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
  }, [DAOService, activeNetwork, wallet?.address, user?.login, router?.query?.network]);

  return (
    <div>
      <style>{colorsToCSS(settings?.theme?.colors)}</style>

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

              <div className="col">
                <ThemeColors
                  colors={settings?.theme?.colors}
                  similar={settings?.theme?.similar}
                  setColor={handleColorChange}
                />
              </div>

              <div className="row px-0 mx-0 mt-3">
                <NetworkContractSettings/>
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
