import {useEffect, useState} from "react";
import {Col} from "react-bootstrap";

import {GetServerSideProps} from "next";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";

import InternalLink from "components/internal-link";
import NothingFound from "components/nothing-found";
import MyNetworkSettings from "components/profile/my-network-settings";
import ProfileLayout from "components/profile/profile-layout";
import RegistryGovernorSettings from "components/profile/registry-governor-settings";
import TabbedNavigation from "components/tabbed-navigation";

import {useAppState} from "contexts/app-state";
import {changeLoadState} from "contexts/reducers/change-load";

import {Network} from "interfaces/network";

import useApi from "x-hooks/use-api";

import {NetworkSettingsProvider, useNetworkSettings} from "../../../contexts/network-settings";

export const ContainerTab = ({ children }) => 
  <div className="px-2 pt-2 border border-dark-gray container-my-network">{children}</div>;

export function MyNetwork() {
  const {t} = useTranslation(["common", "custom-network"]);

  const [myNetwork, setMyNetwork] = useState<Network>();

  const { state, dispatch } = useAppState();
  
  const { searchNetworks } = useApi();
  const { setForcedNetwork } = useNetworkSettings()
  const defaultNetworkName = state.Settings?.defaultNetworkConfig?.name?.toLowerCase() || "bepro";

  const [isGovernorRegistry, setIsGovernorRegistry] = useState(false);
  
  const TABS = [
    {
      eventKey: "my-network",
      title: "Network",
      component: (
        <ContainerTab>
          <MyNetworkSettings network={myNetwork} updateEditingNetwork={updateEditingNetwork} />
        </ContainerTab>
        )
    },
    isGovernorRegistry ? {
      eventKey: "registry",
      title: "Registry",
      component: (
        <ContainerTab>
          <RegistryGovernorSettings />
        </ContainerTab>
        )
    } : null
  ];

  async function updateEditingNetwork() {
    dispatch(changeLoadState(true));

    searchNetworks({
      creatorAddress: state.currentUser.walletAddress,
      isClosed: false
    })
      .then(({ count , rows }) => {
        const savedNetwork = count > 0 ? rows[0] : undefined;

        if (savedNetwork)
          sessionStorage.setItem(`bepro.network:${savedNetwork.name.toLowerCase()}`, JSON.stringify(savedNetwork));

        setMyNetwork(savedNetwork);
        setForcedNetwork(savedNetwork);
      })
      .catch(error => console.debug("Failed to get network", error))
      .finally(() => dispatch(changeLoadState(false)));
  }

  useEffect(() => {
    if (!state.currentUser?.walletAddress) return;

    updateEditingNetwork();
  }, [state.currentUser?.walletAddress]);

  useEffect(() => {
    if(!state.Service?.active || !state.currentUser?.walletAddress) return;

    state.Service?.active.isRegistryGovernor(state.currentUser?.walletAddress).then(setIsGovernorRegistry)
  }, [state.currentUser?.walletAddress])

  return(
    <ProfileLayout>
      { !myNetwork && 
        <Col className="pt-5">
          <NothingFound description={t("custom-network:errors.not-found")}>
            <InternalLink
              href={
                state.Service?.network?.active?.name?.toLowerCase() === defaultNetworkName
                  ? "/new-network"
                  : "/networks"
              }
              label={String(t("actions.create-one"))}
              uppercase
            />
          </NothingFound>
        </Col>
      ||
        <Col xs={10}>
          <TabbedNavigation
            className="my-network-tabs border border-dark-gray"
            defaultActiveKey="my-network"
            tabs={TABS.filter(v => v !== null)}
          />
        </Col>
      }
    </ProfileLayout>
  );
}

export default () => <NetworkSettingsProvider><MyNetwork></MyNetwork></NetworkSettingsProvider>

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {

  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "connect-wallet-button",
        "my-oracles",
        "bounty",
        "pull-request",
        "custom-network",
        "profile",
        "change-token-modal"
      ]))
    }
  };
};
