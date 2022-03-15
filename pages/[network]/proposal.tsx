import { getSession } from "next-auth/react";
import React, { useEffect, useState } from "react";
import { GetServerSideProps } from "next/types";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useIssue } from "contexts/issue";
import { useRouter } from "next/router";
import {
  INetworkProposal,
  Proposal,
  IDistribuitonPerUser,
} from "interfaces/proposal";
import ProposalHero from "components/proposal-hero";
import useNetworkTheme from "x-hooks/use-network";
import useApi from "x-hooks/use-api";
import ProposalPullRequestDetail from "components/proposal-pullrequest-details";
import { pullRequest } from "interfaces/issue-data";
import CustomContainer from "components/custom-container";
import { handlePercentage } from "helpers/handlePercentage";
import ProposalListAddresses from "components/proposal-list-addresses";
import ProposalActionCard from "components/proposal-action-card";

export default function PageProposal() {
  const router = useRouter();
  const { getUserOf } = useApi();
  const { activeIssue, networkIssue } = useIssue();
  const { getURLWithNetwork } = useNetworkTheme();
  const [proposal, setProposal] = useState<Proposal>({} as Proposal);
  const [networkProposal, setNetworkProposal] = useState<INetworkProposal>({} as INetworkProposal);
  const [pullRequest, setPullRequest] = useState<pullRequest>({} as pullRequest);
  const [usersDistribution, setUsersDistribution] = useState<IDistribuitonPerUser[]>([]);

  async function loadUsersDistribution() {
    if (networkProposal?.prAddresses?.length < 1 || networkProposal?.prAmounts?.length < 1)
      return;

    async function mapUser(address: string, i: number): Promise<IDistribuitonPerUser> {
      const { githubLogin } = await getUserOf(address);
      const oracles = networkProposal?.prAmounts[i].toString();
      const percentage = handlePercentage(+oracles, +activeIssue?.amount, 2);

      return { githubLogin, percentage, address, oracles };
    }
    const maping = networkProposal?.prAddresses?.map(mapUser) || [];
    await Promise.all(maping).then(setUsersDistribution);
  }
  async function loadData() {
    const { proposalId, id: issueId, repoId } = router.query;
    const mergeProposal = activeIssue?.mergeProposals.find(
      (p) => +p.id === +proposalId
    );
    const networkProposals = networkIssue?.networkProposals?.[+proposalId];

    if (!mergeProposal || !networkProposals) {
      if (issueId && repoId) {
        const path = await getURLWithNetwork("/bounty", {
          id: issueId,
          repoId: repoId,
        })
        return router?.push(path);
      }

      return router?.push("/404");
    }

    const PR = activeIssue?.pullRequests.find(
      (pr) => pr.id === mergeProposal?.pullRequestId
    );
    setPullRequest(PR);
    setProposal(mergeProposal);
    setNetworkProposal(networkProposals);
  }

  useEffect(() => {
    loadUsersDistribution();
  }, [networkProposal, activeIssue]);

  useEffect(() => {
    loadData();
  }, [router.query, activeIssue, networkIssue]);

  return (
    <>
      <ProposalHero proposal={proposal} networkProposal={networkProposal} />
      <CustomContainer>
        <div className="mt-3">
          <ProposalPullRequestDetail
            currentPullRequest={pullRequest}
            usersDistribution={usersDistribution}
          />
        </div>
        <div className="mt-3 row justify-content-between">
          <ProposalListAddresses usersDistribution={usersDistribution} />
          <ProposalActionCard
            proposal={proposal}
            networkProposal={networkProposal}
            onMerge={() => console.log("merge")}
            onDispute={() => console.log("dispute")}
          />
        </div>
      </CustomContainer>
      {/*
      <NotMergeableModal
        currentGithubLogin={githubLogin}
        issuePRs={issuePRs}
        currentAddress={currentAddress}
        issue={issueMicroService}
        pullRequest={pullRequestGh}
        mergeProposal={proposalBepro}
        isFinalized={isFinalized}
        isCouncil={isCouncil}
      />
      <ConnectWalletButton asModal={true} /> */}
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      session: await getSession(),
      ...(await serverSideTranslations(locale, [
        "common",
        "proposal",
        "pull-request",
        "connect-wallet-button",
      ])),
    },
  };
};
