import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next/types";

import ListIssues from "components/list-issues";
import PageHero, { InfosHero } from "components/page-hero";

import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";

import { handleNetworkAddress } from "helpers/custom-network";

import useApi from "x-hooks/use-api";

export default function PageDevelopers() {
  const { t } = useTranslation(["common"]);

  const { getTotalUsers } = useApi();
  const { service: DAOService } = useDAO();
  const { activeNetwork } = useNetwork();

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
    if (!DAOService || !activeNetwork?.networkToken) return;

    Promise.all([
      DAOService.getClosedBounties(handleNetworkAddress(activeNetwork)).catch(() => 0),
      DAOService.getOpenBounties(handleNetworkAddress(activeNetwork)).catch(() => 0),
      DAOService.getTotalSettlerLocked(handleNetworkAddress(activeNetwork)).catch(() => 0),
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
          currency: activeNetwork.networkToken.symbol || t("misc.$token")
        },
        {
          value: totalUsers,
          label: t("heroes.protocol-members")
        }
      ]);
    });
  }, [DAOService, activeNetwork?.networkToken]);

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
      ...(await serverSideTranslations(locale, ["common", "bounty"]))
    }
  };
};
