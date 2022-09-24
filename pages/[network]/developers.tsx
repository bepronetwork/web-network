import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next/types";

import ListIssues from "components/list-issues";
import PageHero, { InfosHero } from "components/page-hero";

import { useDAO } from "contexts/dao";

import useApi from "x-hooks/use-api";

export default function PageDevelopers() {
  const { t } = useTranslation(["common"]);

  const { getTotalUsers } = useApi();
  const { service: DAOService } = useDAO();

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
    if (!DAOService) return;

    Promise.all([
      DAOService.getClosedBounties().catch(() => 0),
      DAOService.getOpenBounties().catch(() => 0),
      DAOService.getTotalNetworkToken().catch(() => 0),
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
          value: onNetwork,
          label: t("heroes.bounties-in-network"),
          currency: t("$oracles")
        },
        {
          value: totalUsers,
          label: t("heroes.protocol-members")
        }
      ]);
    });
  }, [DAOService]);

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
