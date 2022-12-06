import {useEffect, useState} from "react";
import {Container, Row} from "react-bootstrap";

import {GetServerSideProps} from "next";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import getConfig from "next/config";
import {useRouter} from "next/router";
import {NetworkSetup} from "components/setup/network-setup";
import {RegistrySetup} from "components/setup/registry-setup";
import TabbedNavigation from "components/tabbed-navigation";

import {useAppState} from "contexts/app-state";

import {Network} from "interfaces/network";

import useApi from "x-hooks/use-api";
import ChainsSetup from "../components/setup/chains-setup";
import ConnectGithubSetup from "../components/setup/connect-github-setup";
import {CallToAction} from "../components/setup/call-to-action";
import WrongNetworkModal from "../components/wrong-network-modal";

const { publicRuntimeConfig: { adminWallet } } = getConfig();

export default function SetupPage(){
  const { replace } = useRouter();
  const { t } = useTranslation(["setup", "common"])

  const [activeTab, setActiveTab] = useState("registry");
  const [defaultNetwork, setDefaultNetwork] = useState<Network>();

  const { searchNetworks } = useApi();
  const { state: { currentUser, Settings, supportedChains } } = useAppState();

  const isConnected = !!currentUser?.walletAddress;
  const isAdmin = adminWallet?.toLowerCase() === currentUser?.walletAddress?.toLowerCase();

  const networkRegistryAddress = Settings?.contracts?.networkRegistry;

  useEffect(() => {
    if (isConnected && adminWallet && !isAdmin)
      replace("/networks");
  }, [adminWallet, currentUser?.walletAddress]);

  function searchForNetwork() {
    if (!isConnected || !isAdmin) return;

    searchNetworks({
      isDefault: true
    })
      .then(({ rows, count }) => {
        if (count > 0)
          setDefaultNetwork(rows[0]);
      });
  }

  useEffect(searchForNetwork, [isConnected, isAdmin, currentUser?.walletAddress]);

  if (!isConnected)
    return <WrongNetworkModal />;

  const tabs = [
    {
      eventKey: 'githubConnection',
      title: t('common:connect-github'),
      component: <><ConnectGithubSetup /></>
    },
    {
      eventKey: 'supportedChains',
      title: t('setup:chains.title'),
      component: (
        !currentUser?.login
          ? <CallToAction disabled={false} executing={false} call="missing github configuration step" action="go to" color="info" onClick={() => setActiveTab('githubConnection')} /> // eslint-ignore-line
          : <ChainsSetup />
      )
    },
    {
      eventKey: "registry",
      title: t("setup:registry.title"),
      component: (
        !supportedChains.length
          ? <CallToAction disabled={false} executing={false} call="missing supported chains configuration step" action="go to" color="info" onClick={() => setActiveTab('supportedChains')} /> // eslint-ignore-line
          : <RegistrySetup registryAddress={networkRegistryAddress}
                           isVisible={activeTab === "registry"} />
      )
    },
    {
      eventKey: "network",
      title: t("setup:network.title"),
      component: (
        !supportedChains.length
          ? <CallToAction disabled={false} executing={false} call="missing supported chains configuration step" action="go to" color="info" onClick={() => setActiveTab('supportedChains')} /> // eslint-ignore-line
          : <NetworkSetup isVisible={activeTab === "network"}
                          refetchNetwork={searchForNetwork}
                          defaultNetwork={defaultNetwork}/>
      )
    }
  ];

  return(
    <Container>
      <Row className="text-center">
        <h1>{t("title")}</h1>
      </Row>

      {(isConnected && isAdmin) &&
        <Row className="mt-2">
          <TabbedNavigation
            tabs={tabs}
            forceActiveKey={activeTab}
            className="issue-tabs"
            defaultActiveKey="githubConnection"
            onTransition={setActiveTab}
          />
        </Row>
      }

    </Container>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "custom-network",
        "connect-wallet-button",
        "change-token-modal",
        "setup"
      ])),
    },
  };
};
