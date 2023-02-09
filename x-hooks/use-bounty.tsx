import {useContext} from "react";

import {useRouter} from "next/router";

import {useAppState} from "contexts/app-state";
import {BountyEffectsContext} from "contexts/bounty-effects";
import {
  changeCurrentBountyComments,
  changeCurrentBountyData
} from "contexts/reducers/change-current-bounty";
import {changeSpinners} from "contexts/reducers/change-spinners";

import { issueParser } from "helpers/issue";

import {IssueData, pullRequest} from "interfaces/issue-data";

import useApi from "x-hooks/use-api";
import useChain from "x-hooks/use-chain";
import { useNetwork } from "x-hooks/use-network";
import useOctokit from "x-hooks/use-octokit";

const CACHE_BOUNTY_TIME = 60 * 1000; // 1min

export function useBounty() {

  if (!useContext(BountyEffectsContext))
    throw new Error(`useBounty() depends on <BountyEffectsProvider />`);

  const { chain } = useChain();
  const { getIssue } = useApi();
  const { query, replace } = useRouter();
  const { state, dispatch } = useAppState();
  const { getURLWithNetwork } = useNetwork();
  const { getIssueOrPullRequestComments, getPullRequestDetails, getPullRequestReviews } = useOctokit();

  function isCurrentBountyCached() {
    const lastUpdated = state.currentBounty?.lastUpdated;
    const {id, githubId, repository_id} = state.currentBounty?.data || {};

    if (id && query.id === githubId && +query.repoId === repository_id)
      if (lastUpdated && +new Date() - lastUpdated <= CACHE_BOUNTY_TIME)
        return true;

    return false;
  }

  function getDatabaseBounty(force = false) {
    if (!query?.id || !query.repoId || !chain)
      return;

    if (!force && isCurrentBountyCached() || state.spinners?.bountyDatabase)
      return;

    dispatch(changeSpinners.update({bountyDatabase: true}))

    getIssue(+query.repoId, +query.id, query.network.toString(), chain.chainId)
      .then((bounty: IssueData) => {
        const parsedBounty = issueParser(bounty);

        dispatch(changeCurrentBountyData(parsedBounty));

        return Promise.all([
          getIssueOrPullRequestComments(bounty?.repository?.githubPath, +bounty?.githubId),
          parsedBounty
        ]);
      })
      .then(([comments, bounty]) => {
        dispatch(changeCurrentBountyComments(comments));
        dispatch(changeSpinners.update({bountyDatabase: false}));
        
        return Promise.all([bounty, ...bounty.pullRequests.map(pullRequest =>
          getPullRequestDetails(bounty.repository.githubPath, +pullRequest.githubId)
            .then(details => ({
              ...pullRequest,
              isMergeable: details?.mergeable === "MERGEABLE",
              merged: details?.merged,
              state: details?.state,
              approvals: details?.approvals,
              hash: details?.hash
            })))]);
      })
      .then(pullRequests => {
        const extendedPrs = pullRequests.slice(1) as pullRequest[];
        dispatch(changeCurrentBountyData({ ...pullRequests[0], pullRequests: extendedPrs }));
      })
      .catch(error => {
        console.debug("Failed to get database data", error);
        replace(getURLWithNetwork("/"));
      })
      .finally(() => dispatch(changeSpinners.update({bountyDatabase: false})));
  }

  function getExtendedPullRequestsForCurrentBounty() {
    if (!state.currentBounty?.data || !state.currentBounty?.data?.pullRequests?.length)
      return Promise.resolve([]);

    const bounty = state.currentBounty.data;

    return Promise.all(bounty.pullRequests.map(pullRequest =>
      getPullRequestDetails(bounty.repository.githubPath, +pullRequest.githubId)
        .then(details =>
          Promise.all([
            getIssueOrPullRequestComments(bounty.repository.githubPath, +pullRequest.githubId),
            getPullRequestReviews(bounty.repository.githubPath, +pullRequest.githubId)
          ])
            .then(([comments, reviews]) => ({
              ...pullRequest,
              isMergeable: details.mergeable === "MERGEABLE",
              merged: details.merged,
              state: details.state,
              comments,
              reviews
            })))))
      .then(extendedPrs => {
        return extendedPrs;
      })
      .catch(e => {
        console.error(`Failed to get extended pull-requests`, e);
        return;
      })
  }

  return {
    getExtendedPullRequestsForCurrentBounty,
    getDatabaseBounty
  }
}