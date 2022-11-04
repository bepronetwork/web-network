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

import { useAppState } from "contexts/app-state";
import { addToast } from "contexts/reducers/change-toaster";


import { ProposalExtended } from "interfaces/bounty";
import { MetamaskErrors } from "interfaces/enums/Errors";
import { pullRequest } from "interfaces/issue-data";
import {Proposal, DistribuitonPerUser} from "interfaces/proposal";

import useApi from "x-hooks/use-api";
import useBepro from "x-hooks/use-bepro";

import {BountyProvider, useBounty} from "../../x-hooks/use-bounty";

export default function PageProposal() {
  useBounty();
  const router = useRouter();
  const { t } = useTranslation();

  const { dispatch, state } = useAppState();
  
  const [proposal, setProposal] = useState<Proposal>({} as Proposal);
  const [pullRequest, setPullRequest] = useState<pullRequest>({} as pullRequest);
  const [usersDistribution, setUsersDistribution] = useState<DistribuitonPerUser[]>([]);
  const [networkProposal, setNetworkProposal] = useState<ProposalExtended>({} as ProposalExtended);
  
  const {getChainBounty, getDatabaseBounty} = useBounty();
  const { getUserOf, processEvent, createNFT } = useApi();

  const { handlerDisputeProposal, handleCloseIssue, handleRefuseByOwner } = useBepro();

  async function closeIssue() {
    try{
      const {url} = await createNFT(state.currentBounty?.data?.contractId, proposal.contractId)
      
      handleCloseIssue(+state.currentBounty?.data?.contractId, +proposal.contractId, url)
        .then(txInfo => {
          const { blockNumber: fromBlock } = txInfo as { blockNumber: number };

          return processEvent("bounty", "closed", state.Service?.network?.active?.name, { fromBlock } );
        })
        .then(() => {
          getChainBounty(true);
          getDatabaseBounty(true);
          dispatch(addToast({
              type: "success",
              title: t("actions.success"),
              content: t("modals.not-mergeable.success-message")
          }));
        })
    }
    catch(error){
      if (error?.code === MetamaskErrors.UserRejected) return;

      console.log("Failed to close bounty", error);

      dispatch(addToast({
            type: "danger",
            title: t("actions.failed"),
            content: error?.response?.data?.message
      }))}
  }

  async function disputeProposal() {
    return handlerDisputeProposal(+proposal?.scMergeId)
      .then(txInfo => {
        const { blockNumber: fromBlock } = txInfo as { blockNumber: number };

        return processEvent("proposal", "disputed", state.Service?.network?.active?.name, { fromBlock } );
      })
      .then(() => {
        getDatabaseBounty(true);
        getChainBounty(true);
      })
      .catch(error => {
        if (error?.code === MetamaskErrors.UserRejected) return;

        console.log("Failed to dispute proposal", error);

        dispatch(addToast({
            type: "danger",
            title: t("actions.failed"),
            content: error?.response?.data?.message
        }));
      });
  }

  async function handleRefuse() {
    return handleRefuseByOwner(+state.currentBounty?.data?.contractId, +proposal.contractId)
    .then(txInfo => {
      const { blockNumber: fromBlock } = txInfo as { blockNumber: number };

      return processEvent("proposal", "refused", state.Service?.network?.active?.name, { fromBlock } );
    })
    .then(() => {
      getDatabaseBounty(true);
      getChainBounty(true);
      
      dispatch(addToast({
        type: "success",
        title: t("actions.success"),
        content: t("proposal:messages.proposal-refused")
      }));
    })
    .catch(error => {
      if (error?.code === MetamaskErrors.UserRejected) return;
      
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
      const distributedAmount = state.currentBounty?.chainData.tokenAmount.multipliedBy(detail.percentage).dividedBy(100).toFixed();

      return { 
        githubLogin, 
        percentage: detail.percentage, 
        address: detail.recipient, 
        oracles, 
        distributedAmount,
      };
    })).then(setUsersDistribution);
  }, [networkProposal, state.currentBounty?.data]);

  useEffect(() => {
    if (!state.currentBounty?.data || !state.currentBounty?.chainData) return;

    const { proposalId } = router.query;

    const mergeProposal = state.currentBounty?.data?.mergeProposals?.find((p) => +p.id === +proposalId);
    const networkProposals = state.currentBounty?.chainData?.proposals?.[+mergeProposal?.scMergeId];
    const pullRequest = state.currentBounty?.data?.pullRequests.find((pr) => pr.id === mergeProposal?.pullRequestId);

    setProposal(mergeProposal);
    setPullRequest(pullRequest);
    setNetworkProposal(networkProposals);
  }, [router.query, state.currentBounty?.data, state.currentBounty?.chainData]);

  return (
    <BountyProvider>
      <ProposalHero proposal={proposal} />

      <CustomContainer>
        <div className="mt-3">
          <ProposalPullRequestDetail
            currentPullRequest={pullRequest}
            usersDistribution={usersDistribution}
          />
        </div>
        <div className="mt-3 row justify-content-between">
          <ProposalListAddresses usersDistribution={usersDistribution} currency={state.currentBounty?.data?.token?.symbol} />
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
    </BountyProvider>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "proposal",
        "pull-request",
        "connect-wallet-button"
      ]))
    }
  };
};
