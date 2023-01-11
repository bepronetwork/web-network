import { useEffect, useState } from "react";

import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import ListActiveNetworks from "components/bounties/list-active-networks";
import ListRecentIssues from "components/bounties/list-recent-issues";
import ListIssues from "components/list-issues";
import PageHero, { InfosHero } from "components/page-hero";

import { useAppState } from "contexts/app-state";
import { BountyEffectsProvider } from "contexts/bounty-effects";

import useApi from "x-hooks/use-api";


export default function BountiesPage() {
  const { t } = useTranslation(["common", "custom-network"]);
  const [numberOfNetworks, setNumberOfNetworks] = useState(0);
  const [numberOfBounties, setNumberOfBounties] = useState(0);

  const { getTotalNetworks, getTotalBounties } = useApi();
  const {state} = useAppState();


  const [infos, setInfos] = useState<InfosHero[]>([
    {
      value: 0,
      label: t("custom-network:hero.number-of-networks"),
    },
    {
      value: 0,
      label: t("custom-network:hero.number-of-bounties"),
    },
    {
      value: 0,
      label: "in bounties",
      currency: "USD",
    },
    {
      value: 0,
      label: "distributed",
      currency: "USD",
    },
  ]);

  
  useEffect(() => {
    if (state.Service?.active) state.Service?.active.loadRegistry();
  }, [state.Service?.active]);

  useEffect(() => {
    getTotalNetworks().then(setNumberOfNetworks)
    getTotalBounties().then(setNumberOfBounties)
  },[])

  useEffect(() => {    
    setInfos([
      {
        value: numberOfNetworks,
        label: t("custom-network:hero.number-of-networks"),
      },
      {
        value: numberOfBounties,
        label: t("custom-network:hero.number-of-bounties"),
      },
      {
        value: 0,
        label: "in bounties",
        currency: "USD",
      },
      {
        value: 0,
        label: "distributed",
        currency: "USD",
      },
    ]);    
  }, [numberOfNetworks, numberOfBounties]);

  return (
    <BountyEffectsProvider>
      <PageHero
        title={"Bounty Hall"}
        subtitle={"Explanatory text"}
        infos={infos}
      />
      <ListActiveNetworks />
      <ListRecentIssues />
      <ListIssues allNetworks={true} />
    </BountyEffectsProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "connect-wallet-button",
        "custom-network",
        "leaderboard",
      ])),
    },
  };
};
