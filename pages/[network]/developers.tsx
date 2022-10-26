import {useContext, useEffect, useState} from "react";

import BigNumber from "bignumber.js";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next/types";


import ListIssues from "components/list-issues";
import PageHero, { InfosHero } from "components/page-hero";

import useApi from "x-hooks/use-api";

import {AppStateContext} from "../../contexts/app-state";


export default function PageDevelopers() {
  const { t } = useTranslation(["common"]);

  const {state} = useContext(AppStateContext);
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

    Promise.all([
      state.Service?.active.getClosedBounties().catch(() => 0),
      state.Service?.active.getOpenBounties().catch(() => 0),
      state.Service?.active.getTotalNetworkToken().catch(() => BigNumber(0)),
      getTotalUsers(),
    ]).then(([closed, inProgress, onNetwork, totalUsers]) => {
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
          currency: t("$oracles",{ token: state.Service?.network?.active?.networkToken?.symbol || t("misc.$token") })
        },
        {
          value: totalUsers,
          label: t("heroes.protocol-members")
        }
      ]);
    });
  }, [state.Service?.active, state.Service?.network?.active]);

  return (
    <>
      <PageHero
        title={t("heroes.bounties.title")}
        subtitle={t("heroes.bounties.subtitle")}
        infos={infos}
      />
    
      <ListIssues />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, ["common", "bounty", "connect-wallet-button"]))
    }
  };
};
