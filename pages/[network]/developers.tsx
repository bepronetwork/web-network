import {useEffect, useState} from "react";

import {ERC20} from "@taikai/dappkit";
import BigNumber from "bignumber.js";
import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import {GetServerSideProps} from "next/types";


import ListIssues from "components/list-issues";
import PageHero, {InfosHero} from "components/page-hero";

import useApi from "x-hooks/use-api";

import {useAppState} from "../../contexts/app-state";
import {BountyProvider, useBounty} from "../../x-hooks/use-bounty";


export default function PageDevelopers() {
  useBounty();
  const { t } = useTranslation(["common"]);

  const {state} = useAppState();
  const { getTotalUsers } = useApi();


  const [infos, setInfos] = useState<InfosHero[]>([
    {
      value: 0,
      label: t("heroes.in-progress")
    },
    {
      value: 0,
      label: t("heroes.bounties-closed")
    },
    {
      value: 0,
      label: t("heroes.bounties-in-network"),
      currency: t("misc.$token")
    },
    {
      value: 0,
      label: t("heroes.protocol-members")
    }
  ]);

  useEffect(() => {
    if (!state.Service?.active) return;

    console.log(`developers`, state.Service)

    Promise.all([
      state.Service?.active.getClosedBounties().catch(() => 0),
      state.Service?.active.getOpenBounties().catch(() => 0),
      state.Service?.active.getTotalNetworkToken().catch(() => BigNumber(0)),
      getTotalUsers(),
      (state.Service?.network?.active?.networkToken as ERC20)?.symbol(),
    ]).then(([closed, inProgress, onNetwork, totalUsers, symbol]) => {

      console.log(`SYMBOL`, symbol);

      setInfos([
        {
          value: inProgress,
          label: t("heroes.in-progress")
        },
        {
          value: closed,
          label: t("heroes.bounties-closed")
        },
        {
          value: onNetwork.toNumber(),
          label: t("heroes.bounties-in-network"),
          currency: t("$oracles",{ token: symbol || t("misc.$token") })
        },
        {
          value: totalUsers,
          label: t("heroes.protocol-members")
        }
      ]);
    });
  }, [state.Service?.active, state.Service?.network?.active]);

  return (
    <BountyProvider>
      <PageHero
        title={t("heroes.bounties.title")}
        subtitle={t("heroes.bounties.subtitle")}
        infos={infos}
      />
    
      <ListIssues />
    </BountyProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "bounty", "connect-wallet-button"]))
    }
  };
};
