import React, { useContext, useEffect, useState } from "react";

import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import { useRouter } from "next/router";
import { GetServerSideProps } from "next/types";

import ConnectWalletButton from "components/connect-wallet-button";
import CustomContainer from "components/custom-container";
import NotMergeableModal from "components/not-mergeable-modal";
import ProposalActionCard from "components/proposal-action-card";
import ProposalHero from "components/proposal-hero";
import ProposalListAddresses from "components/proposal-list-addresses";
import ProposalPullRequestDetail from "components/proposal-pullrequest-details";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { useIssue } from "contexts/issue";
import { useNetwork } from "contexts/network";
import { addToast } from "contexts/reducers/add-toast";

import { handlePercentage } from "helpers/handlePercentage";

import { pullRequest } from "interfaces/issue-data";
import {
  INetworkProposal,
  Proposal,
  IDistribuitonPerUser
} from "interfaces/proposal";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";

export default function PageProposal() {
  const router = useRouter();
  const { dispatch } = useContext(ApplicationContext);
  const { t } = useTranslation();
  const { getUserOf, mergeClosedIssue } = useApi();
  const { handlerDisputeProposal, handleCloseIssue } = useBepro();
  const { activeIssue, networkIssue, getNetworkIssue } = useIssue();
  const { wallet } = useAuthentication();
  const { activeNetwork } = useNetwork();
  const [proposal, setProposal] = useState<Proposal>({} as Proposal);
  const [networkProposal, setNetworkProposal] = useState<INetworkProposal>({} as INetworkProposal);
  const [pullRequest, setPullRequest] = useState<pullRequest>({} as pullRequest);
  const [usersDistribution, setUsersDistribution] = useState<
    IDistribuitonPerUser[]
  >([]);

  async function closeIssue() {
    handleCloseIssue(+networkIssue._id,
                     activeIssue?.issueId,
                     +proposal.scMergeId)
      .then(() =>
        mergeClosedIssue(activeIssue?.issueId,
                         pullRequest.githubId,
                         proposal?.scMergeId,
                         wallet?.address,
                         activeNetwork?.name))
      .then(() => {
        dispatch(addToast({
            type: "success",
            title: t("actions.success"),
            content: t("modals.not-mergeable.success-message")
        }));
      })
      .catch((error) => {
        dispatch(addToast({
            type: "danger",
            title: t("actions.failed"),
            content: error.response.data.message
        }));
      });
  }

  async function disputeProposal() {
    handlerDisputeProposal(+networkIssue?._id, +proposal?.scMergeId).then(() => {
      getNetworkIssue();
    });
  }

  async function loadUsersDistribution() {
    if (
      networkProposal?.prAddresses?.length < 1 ||
      networkProposal?.prAmounts?.length < 1
    )
      return;

    async function mapUser(address: string,
                           i: number): Promise<IDistribuitonPerUser> {
      const { githubLogin } = await getUserOf(address);
      const oracles = networkProposal?.prAmounts[i].toString();
      const percentage = handlePercentage(+oracles, +activeIssue?.amount, 2);

      return { githubLogin, percentage, address, oracles };
    }
    const maping = networkProposal?.prAddresses?.map(mapUser) || [];
    await Promise.all(maping).then(setUsersDistribution);
  }

  async function loadData() {
    const { proposalId } = router.query;
    const mergeProposal = activeIssue?.mergeProposals.find((p) => +p.id === +proposalId);
    const networkProposals = networkIssue?.networkProposals?.[+proposalId];

    const PR = activeIssue?.pullRequests.find((pr) => pr.id === mergeProposal?.pullRequestId);

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
            currentPullRequest={pullRequest}
            onMerge={closeIssue}
            onDispute={disputeProposal}
          />
        </div>
      </CustomContainer>

      <NotMergeableModal
        issuePRs={activeIssue?.pullRequests}
        issue={activeIssue}
        pullRequest={pullRequest}
        proposal={proposal}
        networkProposal={networkProposal}
      />
      <ConnectWalletButton asModal={true} />
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "proposal",
        "pull-request",
        "connect-wallet-button"
      ]))
    }
  };
};
