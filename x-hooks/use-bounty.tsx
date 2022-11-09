import {createContext, useContext, useEffect} from "react";

import BigNumber from "bignumber.js";
import {useRouter} from "next/router";

import {useAppState} from "../contexts/app-state";
import {
  changeCurrentBountyComments,
  changeCurrentBountyData,
  changeCurrentBountyDataChain,
  changeCurrentBountyDataIsDraft,
  changeCurrentBountyDataIsFinished,
  changeCurrentBountyDataIsInValidation,
} from "../contexts/reducers/change-current-bounty";
import {changeSpinners} from "../contexts/reducers/change-spinners";
import {bountyReadyPRsHasNoInvalidProposals} from "../helpers/proposal";
import {IssueData, pullRequest} from "../interfaces/issue-data";
import useApi from "./use-api";
import useOctokit from "./use-octokit";


const CACHE_BOUNTY_TIME = 60 * 1000; // 1min
const _context = {};

export const BountyContext = createContext(_context);
export const BountyProvider = ({children}) => <BountyContext.Provider value={_context} children={children} />

export function useBounty() {
  if (!useContext(BountyContext))
    throw new Error(`useBounty not inside BountyContext`);

  const {state, dispatch} = useAppState();

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

  function getDatabaseBounty(force = false) {

    console.log(`getDatabaseBounty()`, force);

    if (!state.Service?.network?.active || !query?.id || !query.repoId)
      return;

    if (!force && isCurrentBountyCached() || state.spinners?.bountyDatabase)
      return;

    console.debug(`GET ISSUE`, state.Service)

    dispatch(changeSpinners.update({bountyDatabase: true}))

    getIssue(+query.repoId, +query.id, state.Service.network.lastVisited)
      .then((bounty: IssueData) => {

        console.debug(`GOT ISSUE`);

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
        const extendedBounty = {...bounty, mergeProposals, ...bigNumbers};

        dispatch(changeCurrentBountyData(extendedBounty));
        console.log(`GOT ISSUE DATA`, extendedBounty);
        
        return Promise.all([
          getIssueOrPullRequestComments(bounty.repository.githubPath, +bounty.githubId),
          extendedBounty
        ]);
      })
      .then(([comments, bounty]) => {
        dispatch(changeCurrentBountyComments(comments));
        dispatch(changeSpinners.update({bountyDatabase: false}));
        
        return Promise.all([bounty, ...bounty.pullRequests.map(pullRequest =>
          getPullRequestDetails(bounty.repository.githubPath, +pullRequest.githubId)
            .then(details => ({
              ...pullRequest,
              isMergeable: details.mergeable === "MERGEABLE",
              merged: details.merged,
              state: details.state
            })))]);
      })
      .then(pullRequests => {
        const extendedPrs = pullRequests.slice(1) as pullRequest[];
        dispatch(changeCurrentBountyData({ ...pullRequests[0], pullRequests: extendedPrs }));
      });

  }

  function getChainBounty(force = false) {
    console.log(`getChainBounty`, state)
    if (!state.Service?.active || !state.currentBounty?.data?.contractId || state.spinners?.bountyChain)
      return;

    console.log(`getChainBounty is not cached`, state.currentBounty)

    dispatch(changeSpinners.update({bountyChain: true}))

    state.Service.active.getBounty(state.currentBounty.data.contractId)
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

        console.log(`getChainBounty got data`, bounty);


        state.Service.active.isBountyInDraftChain(bounty.creationDate)
          .then(bool => dispatch(changeCurrentBountyDataIsDraft(bool)));

        bountyReadyPRsHasNoInvalidProposals(bounty, state.Service.network)
          .catch(() => -1)
          .then(value => {
            dispatch(changeCurrentBountyDataIsFinished(value !== 0));
            dispatch(changeCurrentBountyDataIsInValidation([2, 3].includes(value)))
            dispatch(changeSpinners.update({bountyChain: false}))
          });

      });

  }

  /**
   *  todo: getExtendedProposalsForCurrentBounty() should happen on webnetwork-events
   *
   *  MAKE SURE that these functions (getExtendedProposalsForCurrentBounty, getExtendedPullRequestsForCurrentBounty)
   *  are only called once, since they ignore cached information
   */

  function getExtendedProposalsForCurrentBounty() {
    if (!state.currentBounty?.chainData || !state.Service?.active)
      return Promise.resolve([]);

    const bounty = state.currentBounty.chainData;
    const dbBounty = state.currentBounty.data;
    const wallet = state.currentUser?.walletAddress;

    return Promise.all(bounty.proposals.map(proposal =>
        (dbBounty.merged
            ? Promise.resolve(+dbBounty.merged !== proposal.id)
            : state.Service.active.isProposalDisputed(+bounty.id, proposal.id)
        ).then(isDisputed =>
          !wallet
            ? ({...proposal, isDisputed})
            : state.Service.active.getDisputesOf(wallet, +bounty.id, +proposal.id)
              .then(value => ({...proposal, isDisputed, canUserDispute: !value})))))
      .then(proposals => {
        // dispatch(changeCurrentBountyDataProposals(proposals));
        return proposals;
      })
      .catch(e => {
        console.error(`Failed to get extended proposals`, e);
        return;
      });
  }

  function getExtendedPullRequestsForCurrentBounty() {
    if (!state.currentBounty?.data || !state.currentBounty?.data?.pullRequests?.length)
      return Promise.resolve([]);

    const bounty = state.currentBounty.data;

    return Promise.all(bounty.pullRequests.map(pullRequest =>
      getPullRequestDetails(bounty.repository.githubPath, +pullRequest.githubId)
        .then(details =>
          getIssueOrPullRequestComments(bounty.repository.githubPath, +pullRequest.githubId)
            .then(comments => ({
              ...pullRequest,
              isMergeable: details.mergeable === "MERGEABLE",
              merged: details.merged,
              state: details.state,
              comments,
            })))))
      .then(extendedPrs => {
        // dispatch(changeCurrentBountyDataPullRequests(extendedPrs));
        return extendedPrs;
      })
      .catch(e => {
        console.error(`Failed to get extended pull-requests`, e);
        return;
      })
  }

  useEffect(getDatabaseBounty, [state.Service?.network?.active, query?.id, query?.repoId]);
  useEffect(getChainBounty, [state.Service?.active, state.Service?.network, state.currentBounty?.data?.contractId])

  useEffect(() => {
    console.log(`useBounty() started`);
  }, [])

  return {
    getExtendedProposalsForCurrentBounty,
    getExtendedPullRequestsForCurrentBounty,
    getDatabaseBounty,
    getChainBounty,
  }
}