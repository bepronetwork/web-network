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

  useEffect(() => {
    if (!DAOService || !wallet?.address) return;

    dispatch(changeLoadState(true));

    DAOService.getNetworkAdressByCreator(wallet.address)
      .then(networkAddress => {
        if (networkAddress === Defaults.nativeZeroAddress) return { count: 0, rows: [] };
        
        return searchNetworks({
          networkAddress,
          creatorAddress: wallet.address,
          sortBy: "name",
          order: "asc"
        });
      })
      .then(({ count, rows }) => {
        if (count > 0) setMyNetwork(rows[0]);
      })
      .catch(console.log)
      .finally(() => dispatch(changeLoadState(false)));
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
        <Col xs={10}>
          <MyNetworkSettings network={myNetwork} />
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
        "profile"
      ]))
    }
  };
};
