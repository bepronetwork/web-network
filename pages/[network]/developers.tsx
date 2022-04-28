import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { GetServerSideProps } from "next/types";
import { Octokit } from "octokit";

import ListIssues from "components/list-issues";
import PageHero, { IInfosHero } from "components/page-hero";

import { useAuthentication } from "contexts/authentication";
import { useNetwork } from "contexts/network";

import { handleNetworkAddress } from "helpers/custom-network";

import { BeproService } from "services/bepro-service";

import useApi from "x-hooks/use-api";
import useOctokitGraph from "x-hooks/use-octokit-graph";

export default function PageDevelopers() {
  const { t } = useTranslation(["common"]);
  const { beproServiceStarted, user } = useAuthentication();
  const { getTotalUsers } = useApi();
  const { 
    getPullRequestParticipants, 
    getPullRequestLinesOfCode, 
    getIssueOrPullRequestComments,
    getRepositoryForks,
    getRepositoryBranches
  } = useOctokitGraph();

  const [infos, setInfos] = useState<IInfosHero[]>([
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
      currency: "BEPRO"
    },
    {
      value: 0,
      label: t("heroes.protocol-members")
    }
  ]);

  const { activeNetwork } = useNetwork();

  async function loadTotals() {
    if (!beproServiceStarted || !activeNetwork) return;

    const [closed, inProgress, onNetwork, totalUsers] = await Promise.all([
      BeproService.getClosedBounties(handleNetworkAddress(activeNetwork)),
      BeproService.getOpenBounties(handleNetworkAddress(activeNetwork)),
      BeproService.getTotalSettlerLocked(handleNetworkAddress(activeNetwork)),
      getTotalUsers(),
    ])
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
        currency: "BEPRO"
      },
      {
        value: totalUsers,
        label: t("heroes.protocol-members")
      }
    ]);
  }

  useEffect(() => {
    loadTotals();
  }, [beproServiceStarted, activeNetwork]);

  useEffect(() => {
    if (user?.accessToken) {
      getPullRequestParticipants("bepronetwork/bepro-js", 134).then(console.log).catch(console.log);
      getPullRequestLinesOfCode("bepronetwork/bepro-js", 134).then(console.log).catch(console.log);
      getIssueOrPullRequestComments("bepronetwork/bepro-js", 134).then(console.log).catch(console.log);
      getRepositoryForks("bepronetwork/webapp-community").then(console.log).catch(console.log);
      getRepositoryBranches("bepronetwork/bepro-js").then(console.log).catch(console.log);
    }
  }, [user?.accessToken]);

  return (
    <>
      <div>
        <PageHero
          title={t("heroes.bounties.title")}
          subtitle={t("heroes.bounties.subtitle")}
          infos={infos}
        />

        <ListIssues />
      </div>
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
