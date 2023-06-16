import {useEffect, useState} from "react";

import {useTranslation} from "next-i18next";
import {serverSideTranslations} from "next-i18next/serverSideTranslations";
import { useRouter } from "next/dist/client/router";
import {GetServerSideProps} from "next/types";

import BountiesList from "components/bounty/bounties-list/controller";
import PageHero, {InfosHero} from "components/page-hero";

import {useAppState} from "contexts/app-state";
import {BountyEffectsProvider} from "contexts/bounty-effects";

import { IssueBigNumberData } from "interfaces/issue-data";

import { SearchBountiesPaginated } from "types/api";

import getBountiesListData from "x-hooks/api/get-bounties-list-data";
import useApi from "x-hooks/use-api";
import {useBounty} from "x-hooks/use-bounty";
import useChain from "x-hooks/use-chain";

interface BountiesPageProps {
  bounties: SearchBountiesPaginated;
}

export default function BountiesPage({
  bounties
}: BountiesPageProps) {
  useBounty();
  const { t } = useTranslation(["common"]);
  const { query } = useRouter();

  const { chain } = useChain();
  const {state} = useAppState();
  const { getTotalUsers, getCuratorsResume, searchIssues } = useApi();

  const zeroInfo = [
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
      label: t("heroes.in-network"),
      currency: t("misc.$token")
    },
    {
      value: 0,
      label: t("heroes.protocol-members")
    }
  ];

  const [infos, setInfos] = useState<InfosHero[]>(zeroInfo);

  useEffect(() => {
    if (!state.Service?.network?.active || !chain || !query?.network) return;

    setInfos(zeroInfo);

    Promise.all([
      searchIssues({
        networkName: query.network.toString(),
        chainId: chain.chainId.toString()
      }).then(({ rows } : { rows: IssueBigNumberData[] }) => rows),
      getCuratorsResume({
        networkName: query.network.toString(),
        chainShortName: query.chain.toString()
      }),
      getTotalUsers(),
      state.Service?.network?.active?.networkToken?.symbol,
    ])
      .then(([bounties, { totalValue }, totalUsers, symbol]) => {
        const closedBounties = bounties.filter(({ state }) => state === "closed").length;
        const inProgress = bounties.filter(({ state }) => !["pending", "canceled", "closed"].includes(state)).length;

        return [closedBounties, inProgress, totalValue, totalUsers, symbol];
      })
      .then(([closed, inProgress, onNetwork, totalUsers, symbol]) => {
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
            label: t("heroes.in-network"),
            currency: t("$oracles",{ token: symbol || t("misc.$token") })
          },
          {
            value: totalUsers,
            label: t("heroes.protocol-members")
          }
        ]);
      });
  }, [state.Service?.network?.active, query?.network, chain]);

  return (
    <BountyEffectsProvider>
      <PageHero
        title={t("heroes.bounties.title")}
        subtitle={t("heroes.bounties.subtitle")}
        infos={infos}
      />

      <BountiesList
        bounties={bounties}
        variant="network"
      />
    </BountyEffectsProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ query, locale }) => {
  const bounties = await getBountiesListData(query)
    .then(({ data }) => data)
    .catch(() => ({ count: 0, rows: [], currentPage: 1, pages: 1 }));

  return {
    props: {
      bounties,
      ...(await serverSideTranslations(locale, ["common", "bounty", "connect-wallet-button"]))
    }
  };
};
