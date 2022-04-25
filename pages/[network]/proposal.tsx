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
  IDistribuitonPerUser
} from "interfaces/proposal";

import { BeproService } from "services/bepro-service";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";

export default function PageProposal() {
  const router = useRouter();
  const { dispatch } = useContext(ApplicationContext);
  const { t } = useTranslation();
  const { getUserOf, pastEventsV2 } = useApi();
  const { handlerDisputeProposal, handleCloseIssue, handleRefuseByOwner } = useBepro();
  const { activeIssue, networkIssue, getNetworkIssue, updateIssue } = useIssue();
  const { activeNetwork } = useNetwork();
  const [proposal, setProposal] = useState<Proposal>({} as Proposal);
  const [networkProposal, setNetworkProposal] = useState<ProposalExtended>({} as ProposalExtended);
  const [pullRequest, setPullRequest] = useState<pullRequest>({} as pullRequest);
  const [usersDistribution, setUsersDistribution] = useState<
    IDistribuitonPerUser[]
  >([]);

  async function closeIssue() {
    handleCloseIssue(+activeIssue?.contractId,
                     +proposal.contractId)
      .then(txInfo => {
        const { blockNumber: fromBlock } = txInfo as any;

        return pastEventsV2("bounty", "closed", activeNetwork?.name, { fromBlock } );
      })
      .then(() => {
        updateIssue(activeIssue?.repository_id, activeIssue?.githubId);

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
            content: error?.response?.data?.message
        }));
      });
  }

  async function disputeProposal() {
    handlerDisputeProposal(+proposal?.scMergeId)
    .then(txInfo => {
      const { blockNumber: fromBlock } = txInfo as any;

      return pastEventsV2("proposal", "disputed", activeNetwork?.name, { fromBlock } );
    })
    .then(() => {
      getNetworkIssue();
    });
  }

  async function handleRefuse() {
    handleRefuseByOwner(+activeIssue?.contractId, +proposal.contractId)
    .then(() => {
      updateIssue(activeIssue?.repository_id, activeIssue?.githubId);
      getNetworkIssue();

      dispatch(addToast({
          type: "success",
          title: t("actions.success"),
          content: t("proposal:messages.proposal-refused")
      }));
    })
    .catch((error) => {
      dispatch(addToast({
          type: "danger",
          title: t("actions.failed"),
          content: error?.response?.data?.message
      }));
    });
  }

  async function loadUsersDistribution() {
    if (!networkProposal?.details?.length) return;
  
    async function mapUser(detail: ProposalDetail, i: number): Promise<IDistribuitonPerUser> {
      if(!detail.recipient) return;
      
      const { githubLogin } = await getUserOf(detail.recipient);
      const oracles = networkProposal?.details[i]?.percentage.toString();
      const distributedAmount = 
        await BeproService.calculateDistributedAmounts(networkIssue.tokenAmount, [detail.percentage]);

      return { 
        githubLogin, 
        percentage: detail.percentage, 
        address: detail.recipient, 
        oracles, 
        distributedAmount: distributedAmount.proposals[0] 
      };
    }
    const maping = networkProposal?.details?.map(mapUser) || [];
    await Promise.all(maping).then(setUsersDistribution);
  }

  async function loadData() {
    const { proposalId } = router.query;
    const mergeProposal = activeIssue?.mergeProposals.find((p) => +p.id === +proposalId);
    const networkProposals = networkIssue?.proposals?.[+mergeProposal?.contractId];

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
