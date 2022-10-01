import React, {
  createContext,
  useCallback, useContext, useEffect, useMemo, useState
} from "react";

import { Defaults } from "@taikai/dappkit";
import BigNumber from "bignumber.js";
import { useRouter } from "next/router";


import { useAuthentication } from "contexts/authentication";
import { useNetwork } from "contexts/network";

import { bountyReadyPRsHasNoInvalidProposals } from "helpers/proposal";

import { BountyExtended, ProposalExtended } from "interfaces/bounty";
import {
  IssueData,
  pullRequest,
  IssueDataComment
} from "interfaces/issue-data";

import useApi from "x-hooks/use-api";
import useOctokit from "x-hooks/use-octokit";

import { useDAO } from "./dao";


export interface IActiveIssue extends Omit<IssueData, "amount" | "fundingAmount" | "fundedAmount" | "fundedPercent"> {
  comments: IssueDataComment[];
  lastUpdated: number;
  amount?: BigNumber;
  fundingAmount?: BigNumber;
  fundedAmount?: BigNumber;
  fundedPercent?: BigNumber;
}
const TTL = 60 * 2 * 100; // 2 Min
export interface IssueContextData {
  activeIssue: IActiveIssue;
  networkIssue: BountyExtended;
  updateIssue: (repoId: string | number, ghId: string | number) => Promise<IActiveIssue>;
  addNewComment: (prId: number, comment: string) => void;
  getNetworkIssue: () => void;
}

const IssueContext = createContext<IssueContextData>({} as IssueContextData);

export const IssueProvider: React.FC = function ({ children }) {
  const { query } = useRouter();

  const [activeIssue, setActiveIssue] = useState<IActiveIssue>();
  const [networkIssue, setNetworkIssue] = useState<BountyExtended>();
  
  const { getIssue } = useApi();
  const { activeNetwork } = useNetwork();
  const { service: DAOService } = useDAO();
  const { wallet, user } = useAuthentication();
  const { getIssueOrPullRequestComments, getPullRequestDetails } = useOctokit();

  const addNewComment = useCallback((prId: number, comment: string) => {
    const pullRequests = [...activeIssue.pullRequests];
    const prIndex = pullRequests.findIndex((pr) => pr.id === prId);
    const newPr = {
        ...pullRequests[prIndex],
        comments: [...pullRequests[prIndex].comments, comment]
    } as pullRequest;
    pullRequests[prIndex] = newPr;
    setActiveIssue((oldState) => ({ ...oldState, pullRequests }));
  },
    [activeIssue]);

  const updatePullRequests = useCallback(async (prs: pullRequest[], githubPath: string) => {
    const mapPr = prs.map(async (pr) => {
      const [getPr, getComments] = await Promise.all([
        getPullRequestDetails(githubPath, +pr.githubId),
        getIssueOrPullRequestComments(githubPath, +pr.githubId)
      ]);
      pr.isMergeable = getPr?.mergeable === "MERGEABLE";
      pr.merged = getPr?.merged;
      pr.state = getPr?.state;
      pr.comments = getComments as IssueDataComment[];
      return pr;
    });

    return Promise.all(mapPr);
  }, [user?.accessToken]);

  const updateIssue = useCallback(async (repoId: string | number, ghId: string | number): Promise<IActiveIssue> => {
    if (!activeNetwork?.name || query?.network !== activeNetwork?.name) return;

    const issue = await getIssue(repoId, ghId, activeNetwork?.name);

    if (!issue) throw new Error("Issue not found");

    const ghPath = issue.repository.githubPath;

    if (issue?.pullRequests?.length > 0) {
      issue.pullRequests = await updatePullRequests(issue?.pullRequests,
                                                    ghPath);
    }

    const comments = await getIssueOrPullRequestComments(ghPath, +issue.githubId)
      .catch(error => {
        console.log("Failed to get comments", error);
        return [];
      });
      
    const newActiveIssue = {
        ...issue,
        comments,
        mergeProposals: issue.mergeProposals.map(mp => 
          ({...mp, isMerged: issue.merged !== null && +mp.scMergeId === +issue.merged})),
        lastUpdated: +new Date(),
        amount: BigNumber(issue.amount),
        fundingAmount: BigNumber(issue.fundingAmount),
        fundedAmount: BigNumber(issue.fundedAmount)
    } as IActiveIssue;
  
    setActiveIssue(newActiveIssue);

    return newActiveIssue;
  },
    [activeNetwork, query?.repoId, query?.id, user?.accessToken]);

  const getNetworkIssue = useCallback(async () => {
    if (!activeIssue?.contractId || !DAOService?.network?.contractAddress)
      return;
      
    const bounty = await DAOService.getBounty(activeIssue?.contractId);

    const readyPRsCheck = await bountyReadyPRsHasNoInvalidProposals(bounty, DAOService.network).catch(() => -1);
    const isFinished = readyPRsCheck !== 0;
    const isInValidation = [2, 3].includes(readyPRsCheck);

    let isDraft = null;

    try {
      isDraft = await DAOService.isBountyInDraftChain(bounty.creationDate);
    } catch (error) {
      console.error(error);
    }
    const networkProposals: ProposalExtended[] = [];

    for (const proposal of bounty.proposals) {
      const isDisputed = activeIssue?.merged
        ? +activeIssue?.merged !== +proposal.id
        : await DAOService.isProposalDisputed(+bounty.id, +proposal.id).catch(() => false);

      let isDisputedByAddress = false;
      
      if (wallet?.address) 
        isDisputedByAddress = await DAOService.getDisputesOf(wallet.address, bounty.id, proposal.id).catch(() => 0) > 0;

      networkProposals[+proposal.id] = {
        ...proposal,
        isDisputed,
        canUserDispute: !isDisputedByAddress
      };
    }

    const pullRequests = bounty.pullRequests
      .filter(pr => !pr.canceled)
      .map(pullRequest => ({
        ...pullRequest,
        isCancelable: !bounty.proposals.find(proposal => proposal.prId === pullRequest.id),
      }));

    const transactionalTokenData = await DAOService.getERC20TokenData(bounty.transactional);
    const rewardTokenData = bounty.rewardToken !== Defaults.nativeZeroAddress ? 
      await DAOService.getERC20TokenData(bounty.rewardToken).catch(() => undefined) : undefined;
    const fundedAmount = bounty.funding.reduce((acc, benefactor) => benefactor.amount.plus(acc), BigNumber(0));
    const fundedPercent = fundedAmount.multipliedBy(100).dividedBy(bounty.fundingAmount);

    setNetworkIssue({ 
      ...bounty, 
      isDraft, 
      pullRequests,
      proposals: networkProposals,
      isFinished,
      isInValidation,
      isFundingRequest: bounty.fundingAmount.gt(0),
      transactionalTokenData,
      rewardTokenData,
      fundedAmount,
      fundedPercent
    });
    return { ...bounty, isDraft, networkProposals };
  }, [activeIssue, wallet?.address, DAOService?.network?.contractAddress]);

  useEffect(() => {
    getNetworkIssue();
  }, [activeIssue, wallet?.address, DAOService?.network?.contractAddress]);

  useEffect(() => {    
    const noExpired = +new Date() - activeIssue?.lastUpdated <= TTL;

    if (query.id && query.repoId) {
      if (
        query.id !== activeIssue?.githubId ||
        +query.repoId !== +activeIssue?.repository_id || !noExpired
      ) {
        setActiveIssue(null);
        updateIssue(`${query.repoId}`, `${query.id}`);
      }
    }
  }, [query, activeNetwork, user?.accessToken]);

  const memorizeValue = useMemo<IssueContextData>(() => ({
      activeIssue,
      networkIssue,
      addNewComment,
      updateIssue,
      getNetworkIssue
  }),
    [activeIssue, networkIssue, addNewComment, updateIssue, getNetworkIssue]);

  return (
    <IssueContext.Provider value={memorizeValue}>
      {children}
    </IssueContext.Provider>
  );
};

export function useIssue(): IssueContextData {
  const context = useContext(IssueContext);

  if (!context) {
    throw new Error("useIssue must be used within an IssueProvider");
  }

  return context;
}
