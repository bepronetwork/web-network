import {ReactNode, useEffect, useState} from "react";

import {useTranslation} from "next-i18next";

import NetworkGovernanceSettings from "components/network/settings/governance/controller";
import NetworkLogoAndColorsSettings from "components/network/settings/logo-and-colors/controller";
import NetworkRegistrySettings from "components/network/settings/registry/controller";
import MyNetworkSettingsView from "components/network/settings/view";

import {useAppState} from "contexts/app-state";
import {useNetworkSettings} from "contexts/network-settings";
import {toastError, toastSuccess} from "contexts/reducers/change-toaster";

import {IM_AM_CREATOR_NETWORK} from "helpers/constants";
import {psReadAsText} from "helpers/file-reader";

import {Network} from "interfaces/network";

import {SearchBountiesPaginated} from "types/api";

import {useUpdateNetwork} from "x-hooks/api/network";
import {useAuthentication} from "x-hooks/use-authentication";
import {useNetwork} from "x-hooks/use-network";
import useNetworkTheme from "x-hooks/use-network-theme";

import NetworkManagement from "./management/view";
import AllowList from "./permissions/allow-list/allow-list-controller";
import NetworkPermissions from "./permissions/banned-words/controller";

interface MyNetworkSettingsProps {
  network: Network;
  bounties: SearchBountiesPaginated;
  updateEditingNetwork: () => Promise<void>;
}

export interface TabsProps {
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
  const { signMessage } = useAuthentication();
  const { updateActiveNetwork } = useNetwork();
  const { details, settings, forcedNetwork } = useNetworkSettings();

  const isCurrentNetwork =
    !!network &&
    !!state.Service?.network?.active &&
    network?.networkAddress === state.Service?.network?.active?.networkAddress;

  const networkNeedRegistration = network?.isRegistered === false;

  async function handleSubmit() {
    if (
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
      colors: settings.theme.colors,
      logoIcon: details.iconLogo.value.raw
        ? (await psReadAsText(details.iconLogo.value.raw)).toString()
        : undefined,
      fullLogo: details.fullLogo.value.raw
        ? (await psReadAsText(details.fullLogo.value.raw)).toString()
        : undefined,
      creator: state.currentUser.walletAddress,
      networkAddress: network.networkAddress
    };

    const handleError = (error) => {
      dispatch(toastError(t("custom-network:errors.failed-to-update-network", { error }),
                          t("actions.failed")));
      console.log(error);
    }

    signMessage(IM_AM_CREATOR_NETWORK)
      .then(async () => {
        await useUpdateNetwork(json)
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

  async function updateNetworkData() {
    if (isCurrentNetwork) await updateActiveNetwork(true);

    await updateEditingNetwork();
  }

  function getTabs(_tabs) {
    return _tabs.map(tab => ({
      label: tab?.title,
      active: tab?.eventKey === activeTab,
      onClick: () => setActiveTab(tab?.eventKey)
    }))
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
          <NetworkLogoAndColorsSettings
            network={network}
            errorBigImages={errorBigImages}
          />
        ),
      },
      {
        eventKey: "governance",
        title: t("custom-network:tabs.governance"),
        component: (
          <NetworkGovernanceSettings
            address={network?.networkAddress}
            tokens={network?.tokens}
            network={network}
            updateEditingNetwork={updateEditingNetwork}
          />
        ),
      },
      {
        eventKey: "registry",
        title: t("custom-network:tabs.registry"),
        component: (
          <NetworkRegistrySettings isGovernorRegistry={isGovernorRegistry} />
        ),
      },
      {
        eventKey: "management",
        title: t("bounty:management.label"),
        component: (
          <NetworkManagement bounties={bounties} />
        )
      },
      {
        eventKey: "permissions",
        title: t("custom-network:steps.permissions.title"),
        component: (
          <>
            <NetworkPermissions network={network}/>
            <AllowList networkId={network.id} networkAddress={network.networkAddress} />
          </>
        )
      }
    ])
  },[
    network,
    bounties,
    isGovernorRegistry,
    networkNeedRegistration,
    errorBigImages
  ]);

  return(
    <MyNetworkSettingsView
      themePreview={isCurrentNetwork ? colorsToCSS(settings?.theme?.colors) : ""}
      isNetworkUnregistered={networkNeedRegistration}
      isWalletConnected={!!state.currentUser?.walletAddress}
      updateNetworkData={updateNetworkData}
      networkAddress={network?.networkAddress}
      tabs={getTabs(tabs)}
      tabsProps={tabs}
      activeTab={activeTab}
      isAbleToSave={
        settings?.validated &&
        !network?.isClosed &&
        !networkNeedRegistration &&
        !["registry", "governance", "management", "permissions"].includes(activeTab)
      }
      isUpdating={isUpdating}
      handleSubmit={handleSubmit}
    />
  );
}
