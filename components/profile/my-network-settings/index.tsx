import { ReactNode, useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import ContractButton from "components/contract-button";
import ScrollableTabs from "components/navigation/scrollable-tabs/view";
import { ContainerTab } from "components/profile/my-network-settings/container-tab";
import GovernanceSettings from "components/profile/my-network-settings/governance-settings";
import LogoAndColoursSettings from "components/profile/my-network-settings/logo-and-colours-settings";
import RegistrySettings from "components/profile/my-network-settings/registry-settings";
import RepositoriesListSettings from "components/profile/my-network-settings/repositories-list-settings";
import WarningGithub from "components/profile/my-network-settings/warning-github";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";

import { useAppState } from "contexts/app-state";
import { useNetworkSettings } from "contexts/network-settings";
import {
  toastError,
  toastSuccess
} from "contexts/reducers/change-toaster";

import { IM_AM_CREATOR_NETWORK } from "helpers/constants";
import { psReadAsText } from "helpers/file-reader";

import { StandAloneEvents } from "interfaces/enums/events";
import { Network } from "interfaces/network";

import { SearchBountiesPaginated } from "types/api";

import useApi from "x-hooks/use-api";
import { useAuthentication } from "x-hooks/use-authentication";
import useBepro from "x-hooks/use-bepro";
import { useNetwork } from "x-hooks/use-network";
import useNetworkTheme from "x-hooks/use-network-theme";

import Management from "./management";

interface MyNetworkSettingsProps {
  network: Network;
  bounties: SearchBountiesPaginated;
  updateEditingNetwork: () => void;
}

interface TabsProps {
  eventKey: string;
  title: string;
  component: ReactNode;
}

export default function MyNetworkSettings({
  network,
  bounties,
  updateEditingNetwork,
}: MyNetworkSettingsProps) {
  const { t } = useTranslation(["common", "custom-network", "bounty"]);

  const [errorBigImages, setErrorBigImages] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isGovernorRegistry, setIsGovernorRegistry] = useState(false);
  const [tabs, setTabs] = useState<TabsProps[]>([]);
  const [activeTab, setActiveTab] = useState("logo-and-colours");

  const { state, dispatch } = useAppState();
  const { colorsToCSS } = useNetworkTheme();
  const { updateActiveNetwork } = useNetwork();
  const { updateNetwork, processEvent } = useApi();
  const { handleChangeNetworkParameter } = useBepro();
  const { signMessage } = useAuthentication();
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

    const {
      parameters: {
        draftTime: { value: draftTime },
        disputableTime: { value: disputableTime },
        councilAmount: { value: councilAmount },
        percentageNeededForDispute: { value: percentageForDispute },
      },
    } = settings;

    const networkAddress = network?.networkAddress;
    const failed = [];
    const success = {};

    const promises = await Promise.allSettled([
      ...(draftTime !== forcedNetwork.draftTime
        ? [
            handleChangeNetworkParameter("draftTime",
                                         draftTime,
                                         networkAddress)
              .then(() => ({ param: "draftTime", value: draftTime })),
        ]
        : []),
      ...(disputableTime !== forcedNetwork.disputableTime
        ? [
            handleChangeNetworkParameter("disputableTime",
                                         disputableTime,
                                         networkAddress)
              .then(() => ({ param: "disputableTime", value: disputableTime })),
        ]
        : []),
      ...(councilAmount !== +forcedNetwork.councilAmount
        ? [
            handleChangeNetworkParameter("councilAmount",
                                         councilAmount,
                                         networkAddress)
              .then(() => ({ param: "councilAmount", value: councilAmount })),
        ]
        : []),
      ...(percentageForDispute !== forcedNetwork.percentageNeededForDispute
        ? [
            handleChangeNetworkParameter("percentageNeededForDispute",
                                         percentageForDispute,
                                         networkAddress)
              .then(() => ({ param: "percentageNeededForDispute", value: percentageForDispute })),
        ]
        : []),
    ]);

    promises.forEach((promise) => {
      if (promise.status === "fulfilled") success[promise.value.param] = promise.value.value;
      else failed.push(promise.reason);
    });

    if (failed.length) {
      dispatch(toastError(t("custom-network:errors.updated-parameters", {
            failed: failed.length,
      }),
                          t("custom-network:errors.updating-values")));
      console.error(failed);
    }

    const successQuantity = Object.keys(success).length;

    if (successQuantity) {
      if(draftTime !== forcedNetwork.draftTime)
        Promise.all([
          await processEvent(StandAloneEvents.UpdateBountiesToDraft),
          await processEvent(StandAloneEvents.BountyMovedToOpen)
        ]);

      await processEvent(StandAloneEvents.UpdateNetworkParams)
        .catch(error => console.debug("Failed to update network parameters", error));

      dispatch(toastSuccess(t("custom-network:messages.updated-parameters", {
          updated: successQuantity,
          total: promises.length,
      })));
    }

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
      allowedTokens: {
       transactional: tokens?.allowedTransactions.map((token) => token?.id).filter((v) => v),
       reward: tokens?.allowedRewards.map((token) => token?.id).filter((v) => v)
      },
      parameters: success,
      allowMerge: github?.allowMerge
    };

    const handleError = (error) => {
      dispatch(toastError(t("custom-network:errors.failed-to-update-network", { error }),
                          t("actions.failed")));
      console.log(error);
    }

    signMessage(IM_AM_CREATOR_NETWORK)
      .then(async () => {
        await updateNetwork(json)
          .then(async () => {
            if (isCurrentNetwork) updateActiveNetwork(true);

            return updateEditingNetwork();
          })
          .then(() => {
            dispatch(toastSuccess(t("custom-network:messages.refresh-the-page"),
                                  t("actions.success")));
          })
          .catch(handleError);
      })
      .catch(handleError)
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
    if (!state.Service?.active?.registry?.contractAddress ||
        !state.currentUser?.walletAddress ||
        !state.connectedChain?.id) return;

    state.Service?.active
      .isRegistryGovernor(state.currentUser?.walletAddress)
      .then(setIsGovernorRegistry);
  }, [state.currentUser?.walletAddress, state.Service?.active?.registry?.contractAddress, state.connectedChain?.id]);

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
      {
        eventKey: "management",
        title: t("bounty:management.label"),
        component: (
          <NetworkContainer>
            <Management bounties={bounties} />
          </NetworkContainer>
        )
      }
    ])
  },[
    network,
    isGovernorRegistry,
    networkNeedRegistration,
    errorBigImages
  ]);

  return (
    <>
      {isCurrentNetwork && (
        <style>{colorsToCSS(settings?.theme?.colors)}</style>
      )}

      {!state.currentUser?.login && <WarningGithub />}

      <ScrollableTabs
        tabs={tabs.map(tab => ({
          label: tab?.title,
          active: tab?.eventKey === activeTab,
          onClick: () => setActiveTab(tab?.eventKey)
        }))}
      />

      {tabs.find(({ eventKey }) => activeTab === eventKey)?.component}

      {
        (
          settings?.validated &&
          github?.validated &&
          !network?.isClosed &&
          !networkNeedRegistration &&
          !["registry", "governance"].includes(activeTab)
        ) && (
          <Row className="mt-3 mb-4">
            <Col>
              <ContractButton
                onClick={handleSubmit}
                disabled={isUpdating}
                isLoading={isUpdating}
              >
                <span>{t("custom-network:save-settings")}</span>
              </ContractButton>
            </Col>
          </Row>
        )}
    </>
  );
}
