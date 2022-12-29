import { ReactNode, useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import Button from "components/button";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";
import TabbedNavigation from "components/tabbed-navigation";

import { useAppState } from "contexts/app-state";
import { useNetworkSettings } from "contexts/network-settings";
import {
  toastError,
  toastSuccess
} from "contexts/reducers/change-toaster";

import { psReadAsText } from "helpers/file-reader";

import { Network } from "interfaces/network";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";
import { useNetwork } from "x-hooks/use-network";
import useNetworkTheme from "x-hooks/use-network-theme";

import { ContainerTab } from "./container-tab";
import GovernanceSettings from "./governance-settings";
import LogoAndColoursSettings from "./logo-and-colours-settings";
import RegistrySettings from "./registry-settings";
import RepositoriesListSettings from "./repositories-list-settings";
import WarningGithub from "./warning-github";

interface MyNetworkSettingsProps {
  network: Network;
  updateEditingNetwork: () => void;
}

interface TabsProps {
  eventKey: string;
  title: string;
  component: ReactNode;
}

export default function MyNetworkSettings({
  network,
  updateEditingNetwork,
}: MyNetworkSettingsProps) {
  const { t } = useTranslation(["common", "custom-network"]);

  const [errorBigImages, setErrorBigImages] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGovernorRegistry, setIsGovernorRegistry] = useState(false);
  const [tabs, setTabs] = useState<TabsProps[]>([])

  const { state, dispatch } = useAppState();

  const { colorsToCSS } = useNetworkTheme();
  const { updateNetwork, processEvent } = useApi();
  const { handleChangeNetworkParameter } = useBepro();

  const { updateActiveNetwork } = useNetwork();
  const {
    details,
    github,
    settings,
    tokens,
    forcedNetwork,
  } = useNetworkSettings();

  const isCurrentNetwork =
    !!network &&
    !!state.Service?.network?.active &&
    network?.networkAddress === state.Service?.network?.active?.networkAddress;

  const networkNeedRegistration = network?.isRegistered === false;

  function NetworkContainer({children}) {
    return(
      <ReadOnlyButtonWrapper>
        <ContainerTab>
          {children}
        </ContainerTab>
      </ReadOnlyButtonWrapper>
    )
  }

  async function handleSubmit() {
    if (
      !state.currentUser?.login ||
      !state.currentUser?.walletAddress ||
      !state.Service?.active ||
      !forcedNetwork ||
      forcedNetwork?.isClosed ||
      errorBigImages
    )
      return;

    setIsUpdating(true);

    const json = {
      description: details?.description || "",
      colors: JSON.stringify(settings.theme.colors),
      logoIcon: details.iconLogo.value.raw
        ? await psReadAsText(details.iconLogo.value.raw)
        : undefined,
      fullLogo: details.fullLogo.value.raw
        ? await psReadAsText(details.fullLogo.value.raw)
        : undefined,
      repositoriesToAdd: JSON.stringify(github.repositories
          .filter((repo) => repo.checked && !repo.isSaved)
          .map(({ name, fullName }) => ({ name, fullName }))),
      repositoriesToRemove: JSON.stringify(github.repositories
          .filter((repo) => !repo.checked && repo.isSaved)
          .map(({ name, fullName }) => ({ name, fullName }))),
      creator: state.currentUser.walletAddress,
      githubLogin: state.currentUser.login,
      networkAddress: network.networkAddress,
      accessToken: state.currentUser.accessToken,
      allAllowedTokens: tokens?.allowedTransactions
        .concat(tokens?.allowedRewards)
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
          ...(draftTime !== forcedNetwork.draftTime
            ? [
                handleChangeNetworkParameter("draftTime",
                                             draftTime,
                                             networkAddress),
            ]
            : []),
          ...(disputableTime !== forcedNetwork.disputableTime
            ? [
                handleChangeNetworkParameter("disputableTime",
                                             disputableTime,
                                             networkAddress),
            ]
            : []),
          ...(councilAmount !== +forcedNetwork.councilAmount
            ? [
                handleChangeNetworkParameter("councilAmount",
                                             councilAmount,
                                             networkAddress),
            ]
            : []),
          ...(percentageForDispute !== forcedNetwork.percentageNeededForDispute
            ? [
                handleChangeNetworkParameter("percentageNeededForDispute",
                                             percentageForDispute,
                                             networkAddress),
            ]
            : []),
        ]);

        const failed = [];
        const success = [];

        promises.forEach((promise) => {
          if (promise.status === "fulfilled") success.push(promise.value);
          else failed.push(promise.reason);
        });

        if (failed.length) {
          dispatch(toastError(t("custom-network:errors.updated-parameters", {
                failed: failed.length,
          }),
                              t("custom-network:errors.updating-values")));
          console.error(failed);
        }

        if (success.length){
          if(draftTime !== forcedNetwork.draftTime)
            Promise.all([
              await processEvent("bounty","update-draft-time", network.name),
              await processEvent("bounty","moved-to-open", network.name)
            ])

          dispatch(toastSuccess(t("custom-network:messages.updated-parameters", {
              updated: success.length,
              total: promises.length,
          })));
        }
          

        if (isCurrentNetwork) updateActiveNetwork(true);

        return updateEditingNetwork();
      })
      .then(() => {
        dispatch(toastSuccess(t("custom-network:messages.refresh-the-page"),
                              t("actions.success")));
      })
      .catch((error) => {
        dispatch(toastError(t("custom-network:errors.failed-to-update-network", { error }),
                            t("actions.failed")));

        console.log(error);
      })
      .finally(() => setIsUpdating(false));
  }

  useEffect(() => {
    const logoSize = (details?.fullLogo?.value?.raw?.size || 0) / 1024 / 1024;
    const iconSize = (details?.iconLogo?.value?.raw?.size || 0) / 1024 / 1024;

    if (logoSize + iconSize >= 1) {
      setErrorBigImages(true);
    } else {
      setErrorBigImages(false);
    }
  }, [details?.fullLogo, details?.iconLogo]);

  useEffect(() => {
    if (!state.Service?.active || !state.currentUser?.walletAddress) return;

    state.Service?.active
      .isRegistryGovernor(state.currentUser?.walletAddress)
      .then(setIsGovernorRegistry);
  }, [state.currentUser?.walletAddress]);

  useEffect(() => {
    if(!network) return;

    setTabs([
      {
        eventKey: "logo-and-colours",
        title: t("custom-network:tabs.logo-and-colours"),
        component: (
          <NetworkContainer>
            <LogoAndColoursSettings 
              network={network}
              networkNeedRegistration={networkNeedRegistration}
              updateEditingNetwork={updateEditingNetwork}
              errorBigImages={errorBigImages}
            />
          </NetworkContainer>
        ),
      },
      {
        eventKey: "repositories",
        title: t("custom-network:tabs.repositories"),
        component: (
          <NetworkContainer>
            <RepositoriesListSettings />
          </NetworkContainer>
        ),
      },
      {
        eventKey: "governance",
        title: t("custom-network:tabs.governance"),
        component: (
          <NetworkContainer>
            <GovernanceSettings 
              address={network?.networkAddress}
              tokens={network?.tokens}
              network={network}
              updateEditingNetwork={updateEditingNetwork}
            />
          </NetworkContainer>
        ),
      },
      {
        eventKey: "registry",
        title: t("custom-network:tabs.registry"),
        component: (
          <NetworkContainer>
            <RegistrySettings isGovernorRegistry={isGovernorRegistry}/>
          </NetworkContainer>
        ),
      },
    ])
  },[
    network,
    isGovernorRegistry,
    networkNeedRegistration,
    errorBigImages
  ])

  return (
    <>
      {isCurrentNetwork && (
        <style>{colorsToCSS(settings?.theme?.colors)}</style>
      )}
      {!state.currentUser?.login && <WarningGithub />}
      <TabbedNavigation
        className="my-network-tabs border border-dark-gray"
        defaultActiveKey="logo-and-colours"
        tabs={tabs}
      />
      {settings?.validated &&
        github?.validated &&
        !network?.isClosed &&
        !networkNeedRegistration && (
          <Row className="mt-3 mb-4">
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
        )}
    </>
  );
}
