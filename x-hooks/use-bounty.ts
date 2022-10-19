import {useContext, useEffect} from "react";
import {AppStateContext} from "../contexts/app-state";
import {useRouter} from "next/router";
import useApi from "./use-api";
import useOctokit from "./use-octokit";
import {changeLoadState} from "../contexts/reducers/change-load";
import {
  changeCurrentBounty,
  changeCurrentBountyComments,
  changeCurrentBountyData,
  changeCurrentBountyDataChain,
  changeCurrentBountyDataIsDraft,
  changeCurrentBountyDataIsFinished, changeCurrentBountyDataIsInValidation, changeCurrentBountyDataProposals
} from "../contexts/reducers/change-current-bounty";
import {IssueData} from "../interfaces/issue-data";
import BigNumber from "bignumber.js";
import {bountyReadyPRsHasNoInvalidProposals} from "../helpers/proposal";
import {proposal} from "@taikai/dappkit";

const CACHE_BOUNTY_TIME = 60 * 1000; // 1min

export function useBounty() {
  const {state, dispatch} = useContext(AppStateContext);

  const {query} = useRouter();
  const {getIssue} = useApi();
  const { getIssueOrPullRequestComments, getPullRequestDetails } = useOctokit();

  function isCurrentBountyCached() {
    const lastUpdated = state.currentBounty?.lastUpdated;
    const {id, githubId, repository_id} = state.currentBounty?.data || {};

    if (id && query.id === githubId && +query.repoId === repository_id)
      if (lastUpdated && +new Date() - lastUpdated <= CACHE_BOUNTY_TIME)
        return true;

    return false;
  }

  function getDatabaseBounty() {
    if (!state.Service?.network?.active || (!query?.id || !query.repoId))
      return;

    if (isCurrentBountyCached())
      return;

    console.debug(`Loading bounty information`);

    getIssue(+query.repoId, +query.id, state.Service.network.active.name)
      .then((bounty: IssueData) => {

        const bigNumbers = {
          amount: BigNumber(bounty.amount),
          fundingAmount: BigNumber(bounty.fundingAmount),
          fundedAmount: BigNumber(bounty.fundedAmount)
        }

        const mergeProposalMapper = (proposal) => ({
          ...proposal,
          isMerged: bounty.merged !== null && proposal.scMergeId === bounty.merged
        })

        const mergeProposals = bounty.mergeProposals.map(mergeProposalMapper);
        dispatch(changeCurrentBountyData({...bounty, mergeProposals, ...bigNumbers}));
        return getIssueOrPullRequestComments(bounty.repository.githubPath, +bounty.githubId);
      })
      .then(comments => {
        dispatch(changeCurrentBountyComments(comments));
      });

  }

  function getChainBounty() {
    if (!state.Service?.active || !state.Service?.network || !state.currentBounty?.data?.contractId)
      return;

    if (isCurrentBountyCached())
      return;

    const {getBounty, isBountyInDraftChain} = state.Service.active;

    getBounty(state.currentBounty.data.contractId)
      .then(bounty => {

        const pullRequestsMapper = (pullRequest) => ({
          ...pullRequest,
          isCancelable: !bounty.proposals.find(proposal => proposal.prId === pullRequest.id)
        });

        bounty.pullRequests = bounty.pullRequests.filter(pr => !pr.canceled).map(pullRequestsMapper);
        bounty.fundedAmount = bounty.funding.reduce((p, c) => p.plus(c.amount), BigNumber(0))
        bounty.fundedPercent = bounty.fundedAmount.multipliedBy(100).dividedBy(bounty.fundingAmount);
        bounty.isFundingRequest = bounty.fundingAmount.gt(0);

        // todo: missing tokenInformation

        dispatch(changeCurrentBountyDataChain.update(bounty));

        isBountyInDraftChain(bounty.creationDate)
          .then(bool => dispatch(changeCurrentBountyDataIsDraft(bool)));

        bountyReadyPRsHasNoInvalidProposals(bounty, state.Service.network)
          .catch(() => -1)
          .then(value => {
            dispatch(changeCurrentBountyDataIsFinished(value !== 0));
            dispatch(changeCurrentBountyDataIsInValidation([2, 3].includes(value)))
          });

      });

  }

  /**
   *  todo: there should be a smarter way of doing this, maybe each row should be responsible
   *  todo: for grepping this data off of `state.currentBounty.chainData` when in-view?
   *  todo:
   *  todo: alternatively, we can make this logic on the webnetwork-events actions that deal with
   *  todo: disputes and then this information would already exist when `getBounty()` is called
   *  todo:
   *  todo: what is clear is that we CANNOT hook this logic onto the `getBounty()`
   *  todo: as it would severely decrease our render time (because.. chain is slow, yo!)
   *
   *  MAKE SURE that this function is only called once, since it ignores cached information
   */
  function getExtendedProposalsForCurrentBounty() {
    if (!state.currentBounty?.chainData || !state.Service?.active)
      return Promise.resolve([]);

    const bounty = state.currentBounty.chainData;
    const dbBounty = state.currentBounty.data;
    const wallet = state.currentUser?.walletAddress;

    return Promise.all(
      bounty.proposals.map(proposal =>
        (dbBounty.merged
          ? Promise.resolve(+dbBounty.merged != proposal.id)
          : state.Service.active.isProposalDisputed(+bounty.id, proposal.id)
        ).then(isDisputed =>
          !wallet
            ? ({...proposal, isDisputed})
            : state.Service.active.getDisputesOf(wallet, +bounty.id, +proposal.id)
              .then(value => ({...proposal, isDisputed, canUserDispute: !value})))))
      .then(proposals => {
        // dispatch(changeCurrentBountyDataProposals(proposals));
        return proposals;
      });
  }

  useEffect(getDatabaseBounty, [state.Service?.network?.active, query?.id, query?.repoId]);
  useEffect(getChainBounty, [state.Service?.active, state.Service?.network, state.currentBounty?.data?.contractId])

  return {
    getExtendedProposalsForCurrentBounty
  }
}