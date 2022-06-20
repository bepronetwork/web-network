import React, { useContext, useEffect, useState } from "react";

import { ProposalDetail } from "@taikai/dappkit";
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
import { useIssue } from "contexts/issue";
import { useNetwork } from "contexts/network";
import { addToast } from "contexts/reducers/add-toast";


import { ProposalExtended } from "interfaces/bounty";
import { pullRequest } from "interfaces/issue-data";
import {
  Proposal,
  DistribuitonPerUser
} from "interfaces/proposal";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";

export default function PageProposal() {
  const router = useRouter();
  const { t } = useTranslation();

  const { dispatch } = useContext(ApplicationContext);
  
  const [proposal, setProposal] = useState<Proposal>({} as Proposal);
  const [pullRequest, setPullRequest] = useState<pullRequest>({} as pullRequest);
  const [usersDistribution, setUsersDistribution] = useState<DistribuitonPerUser[]>([]);
  const [networkProposal, setNetworkProposal] = useState<ProposalExtended>({} as ProposalExtended);
  
  const { activeNetwork } = useNetwork();
  const { getUserOf, processEvent } = useApi();
  const { activeIssue, networkIssue, getNetworkIssue, updateIssue } = useIssue();
  const { handlerDisputeProposal, handleCloseIssue, handleRefuseByOwner } = useBepro();

  async function closeIssue() {
    handleCloseIssue(+activeIssue?.contractId, +proposal.contractId)
      .then(txInfo => {
        const { blockNumber: fromBlock } = txInfo as { blockNumber: number };

        return processEvent("bounty", "closed", activeNetwork?.name, { fromBlock } );
      })
      .then(() => {
        updateIssue(activeIssue?.repository_id, activeIssue?.githubId);

        dispatch(addToast({
            type: "success",
            title: t("actions.success"),
            content: t("modals.not-mergeable.success-message")
        }));
      })
      .catch(error => {
        console.log("Failed to close bounty", error);

        dispatch(addToast({
            type: "danger",
            title: t("actions.failed"),
            content: error?.response?.data?.message
        }));
      });
  }

  async function disputeProposal() {
    handlerDisputeProposal(+proposal?.scMergeId)
      .then(txInfo => {
        const { blockNumber: fromBlock } = txInfo as { blockNumber: number };

        return processEvent("proposal", "disputed", activeNetwork?.name, { fromBlock } );
      })
      .then(() => {
        getNetworkIssue();
      })
      .catch(error => {
        console.log("Failed to dispute proposal", error);

        dispatch(addToast({
            type: "danger",
            title: t("actions.failed"),
            content: error?.response?.data?.message
        }));
      });
  }

  async function handleRefuse() {
    handleRefuseByOwner(+activeIssue?.contractId, +proposal.contractId)
    .then(txInfo => {
      const { blockNumber: fromBlock } = txInfo as { blockNumber: number };

      updateIssue(activeIssue?.repository_id, activeIssue?.githubId);
      getNetworkIssue();

      return processEvent("proposal", "refused", activeNetwork?.name, { fromBlock } );
    })
    .then(() => {
      dispatch(addToast({
        type: "success",
        title: t("actions.success"),
        content: t("proposal:messages.proposal-refused")
      }));
    })
    .catch(error => {
      console.log("Failed to refuse proposal", error);

      dispatch(addToast({
          type: "danger",
          title: t("actions.failed"),
          content: error?.response?.data?.message
      }));
    });
  }

  useEffect(() => {
    if (!networkProposal?.details?.length) return;

    Promise.all(networkProposal.details.map( async (detail: ProposalDetail, i: number) => {
      if(!detail.recipient) return;

      const { githubLogin } = await getUserOf(detail.recipient);
      const oracles = networkProposal?.details[i]?.percentage.toString();
      const distributedAmount = networkIssue.tokenAmount * detail.percentage / 100;

      return { 
        githubLogin, 
        percentage: detail.percentage, 
        address: detail.recipient, 
        oracles, 
        distributedAmount 
      };
    })).then(setUsersDistribution);
  }, [networkProposal, activeIssue]);

  useEffect(() => {
    if (!activeIssue || !networkIssue) return;

    const { proposalId } = router.query;

    const mergeProposal = activeIssue?.mergeProposals.find((p) => +p.id === +proposalId);
    const networkProposals = networkIssue?.proposals?.[+mergeProposal?.contractId];
    const pullRequest = activeIssue?.pullRequests.find((pr) => pr.id === mergeProposal?.pullRequestId);

    setProposal(mergeProposal);
    setPullRequest(pullRequest);
    setNetworkProposal(networkProposals);
  }, [router.query, activeIssue, networkIssue]);

  return (
    <>
      <ProposalHero proposal={proposal} />

      <CustomContainer>
        <div className="mt-3">
          <ProposalPullRequestDetail
            currentPullRequest={pullRequest}
            usersDistribution={usersDistribution}
          />
        </div>
        <div className="mt-3 row justify-content-between">
          <ProposalListAddresses usersDistribution={usersDistribution} currency={activeIssue?.token?.symbol} />
          <ProposalActionCard
            proposal={proposal}
            networkProposal={networkProposal}
            currentPullRequest={pullRequest}
            onMerge={closeIssue}
            onDispute={disputeProposal}
            onRefuse={handleRefuse}
          />
        </div>
      </CustomContainer>

      <NotMergeableModal
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
