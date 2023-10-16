import {useEffect, useState} from "react";
import {Container, Row} from "react-bootstrap";

import {GetServerSideProps} from "next";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {useRouter} from "next/router";

import ConnectWalletButton from "components/connect-wallet-button";
import {CallToAction} from "components/setup/call-to-action";
import ChainsSetup from "components/setup/chains-setup";
import {NetworkSetup} from "components/setup/network-setup";
import {RegistrySetup} from "components/setup/registry-setup";
import TabbedNavigation from "components/tabbed-navigation";

import {useAppState} from "contexts/app-state";

import { useSearchNetworks } from "x-hooks/api/network";
import useReactQuery from "x-hooks/use-react-query";

export default function SetupPage(){
  const { replace } = useRouter();
  const { t } = useTranslation(["setup", "common"]);

  const [activeTab, setActiveTab] = useState("supportedChains");

  const { state: { currentUser, supportedChains, connectedChain } } = useAppState();

  const isConnected = !!currentUser?.walletAddress;
  const isAdmin = !!currentUser?.isAdmin;

  function searchForNetwork() {
    return useSearchNetworks({
      isDefault: true
    })
      .then(({ rows, count }) => {
        if (count > 0)
          return rows[0];
        return null;
      });
  }

  const { data: defaultNetwork } = useReactQuery( ["network", "default"],
                                                  searchForNetwork,
                                                  {
                                                    enabled: isConnected && isAdmin
                                                  });

  useEffect(() => {
    if (isConnected && !isAdmin)
      replace("/networks");
  }, [currentUser?.isAdmin, currentUser?.walletAddress]);

  if (!currentUser?.walletAddress)
    return <ConnectWalletButton asModal />;

  const tabs = [
    {
      eventKey: 'supportedChains',
      title: t('setup:chains.title'),
      component: <ChainsSetup />
    },
    {
      eventKey: "registry",
      title: t("setup:registry.title"),
      component: (
        !supportedChains?.length
          ? <CallToAction 
              disabled={false} 
              executing={false} 
              call="missing supported chains configuration step" 
              action="go to" 
              color="info" 
              onClick={() => setActiveTab('supportedChains')} 
            />
          : <RegistrySetup 
              registryAddress={connectedChain?.registry}
              isVisible={activeTab === "registry"}
            />
      )
    },
    {
      eventKey: "network",
      title: t("setup:network.title"),
      component: (
        !supportedChains?.length
          ? <CallToAction 
              disabled={false} 
              executing={false} 
              call="missing supported chains configuration step" 
              action="go to" 
              color="info" 
              onClick={() => setActiveTab('supportedChains')} 
            /> :
          !connectedChain?.registry
            ? <CallToAction 
                disabled={false} 
                executing={false} 
                action="go to" 
                color="info" 
                call="Registry not setup" 
                onClick={() => setActiveTab('registry')} 
              />
            : <NetworkSetup 
                isVisible={activeTab === "network"}
                defaultNetwork={defaultNetwork}
              />
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
            defaultActiveKey="supportedChains"
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
        "setup",
        "profile"
      ])),
    },
  };
};
