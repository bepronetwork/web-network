import { useContext, useEffect, useState } from "react";
import { Col } from "react-bootstrap";

import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import InternalLink from "components/internal-link";
import NothingFound from "components/nothing-found";
import MyNetworkSettings from "components/profile/my-network-settings";
import ProfileLayout from "components/profile/profile-layout";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { cookieKey, useNetwork } from "contexts/network";
import { useNetworkSettings } from "contexts/network-settings";
import { NetworkSettingsProvider } from "contexts/network-settings";
import { changeLoadState } from "contexts/reducers/change-load-state";
import { useSettings } from "contexts/settings";

import { Network } from "interfaces/network";

import useApi from "x-hooks/use-api";

function MyNetwork() {
  const { t } = useTranslation(["common", "custom-network"]);

  const [myNetwork, setMyNetwork] = useState<Network>();

  const { dispatch } = useContext(ApplicationContext);
  
  const { searchNetworks } = useApi();
  const { wallet } = useAuthentication();
  const {  activeNetwork } = useNetwork();
  const { setForcedNetwork } = useNetworkSettings()
  const { settings: appSettings } = useSettings(); 

  const defaultNetworkName = appSettings?.defaultNetworkConfig?.name?.toLowerCase() || "bepro";

  async function updateEditingNetwork() {
    dispatch(changeLoadState(true));

    searchNetworks({
      creatorAddress: wallet.address,
      isClosed: false
    })
      .then(({ count , rows }) => {
        const savedNetwork = count > 0 ? rows[0] : undefined;

        if (savedNetwork)
          sessionStorage.setItem(`${cookieKey}:${savedNetwork.name.toLowerCase()}`, JSON.stringify(savedNetwork));

        setMyNetwork(savedNetwork);
        setForcedNetwork(savedNetwork);
      })
      .catch(error => console.debug("Failed to get network", error))
      .finally(() => dispatch(changeLoadState(false)));
  }

  useEffect(() => {
    if (!wallet?.address) return;

    updateEditingNetwork();
  }, [wallet?.address]);
  
  return(
    <ProfileLayout>
      { !myNetwork && 
        <Col className="pt-5">
          <NothingFound description={t("custom-network:errors.not-found")}>
            <InternalLink
              href={
                activeNetwork?.name.toLowerCase() === defaultNetworkName
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
          <MyNetworkSettings network={myNetwork} updateEditingNetwork={updateEditingNetwork} />
        </Col>
      }
    </ProfileLayout>
  );
}
export default () => (
  <NetworkSettingsProvider>
    <MyNetwork/>
  </NetworkSettingsProvider>
  )

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
