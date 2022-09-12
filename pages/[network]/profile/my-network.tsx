import { useContext, useEffect, useState } from "react";
import { Col } from "react-bootstrap";

import { Defaults } from "@taikai/dappkit";
import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import InternalLink from "components/internal-link";
import NothingFound from "components/nothing-found";
import MyNetworkSettings from "components/profile/my-network-settings";
import ProfileLayout from "components/profile/profile-layout";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { cookieKey } from "contexts/network";
import { changeLoadState } from "contexts/reducers/change-load-state";

import { Network } from "interfaces/network";

import useApi from "x-hooks/use-api";

export default function MyNetwork() {
  const { t } = useTranslation(["common", "custom-network"]);

  const [myNetwork, setMyNetwork] = useState<Network>();

  const { dispatch } = useContext(ApplicationContext);
  
  const { searchNetworks } = useApi();
  const { wallet } = useAuthentication();
  const { service: DAOService } = useDAO();

  async function updateEditingNetwork() {
    dispatch(changeLoadState(true));

    DAOService.getNetworkAdressByCreator(wallet.address)
      .then(registeredNetwork => {
        if (registeredNetwork === Defaults.nativeZeroAddress)
          return { count: -1, rows: [] };

        return searchNetworks({
          creatorAddress: wallet.address,
          isClosed: false
        });
      })
      .then(({ rows, count }) => {
        if (count < 0)
          setMyNetwork(undefined);
        else if (count === 0) 
          console.debug("Something went wrong, the user has a network but it's not saved", wallet.address);
        else {
          const savedNetwork = rows[0];

          setMyNetwork(savedNetwork);
          sessionStorage.setItem(`${cookieKey}:${savedNetwork.name.toLowerCase()}`, JSON.stringify(savedNetwork));
        }

        return true;
      })
      .catch(error => console.debug("Failed to get network", error))
      .finally(() => dispatch(changeLoadState(false)));
  }

  useEffect(() => {
    if (!DAOService || !wallet?.address) return;

    updateEditingNetwork();
  }, [DAOService, wallet?.address]);
  
  return(
    <ProfileLayout>
      { !myNetwork && 
        <Col className="pt-5">
          <NothingFound description={t("custom-network:errors.not-found")}>
            <InternalLink
              href="/new-network"
              label={String(t("actions.create-one"))}
              uppercase
            />
          </NothingFound>
        </Col>
      ||
        <Col xs={10} className="pb-5">
          <MyNetworkSettings network={myNetwork} updateEditingNetwork={updateEditingNetwork} />
        </Col>
      }
    </ProfileLayout>
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
        "custom-network",
        "profile",
        "change-token-modal"
      ]))
    }
  };
};
