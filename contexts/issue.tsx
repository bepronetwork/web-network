import React, {
  createContext,
  useCallback,
  useState,
  useContext,
  useMemo,
  useEffect
} from "react";

import { fromSmartContractDecimals } from "@taikai/dappkit";
import { useRouter } from "next/router";

import {
  IssueData,
  INetworkIssue,
  pullRequest,
  Comment
} from "interfaces/issue-data";
import { INetworkProposal } from "interfaces/proposal";

import { BeproService } from "services/bepro-service";

import useApi from "x-hooks/use-api";
import useOctokit from "x-hooks/use-octokit";

import { useAuthentication } from "./authentication";
import { useNetwork } from "./network";

export interface IActiveIssue extends IssueData {
  comments: Comment[];
  lastUpdated: number;
}
const TTL = 60 * 2 * 100; // 2 Min
export interface IssueContextData {
  activeIssue: IActiveIssue;
  networkIssue: INetworkIssue;
  updateIssue: (repoId: string | number, ghId: string | number) => Promise<IActiveIssue>;
  addNewComment: (prId: number, comment: string) => void;
  getNetworkIssue: () => void;
}

const IssueContext = createContext<IssueContextData>({} as IssueContextData);

export const IssueProvider: React.FC = function ({ children }) {
  const [activeIssue, setActiveIssue] = useState<IActiveIssue>();
  const [networkIssue, setNetworkIssue] = useState<INetworkIssue>();

  const { getIssue } = useApi();
  const { activeNetwork } = useNetwork();
  const { query } = useRouter();
  const { getIssueComments, getPullRequest, getPullRequestComments } =
    useOctokit();

  const { wallet, beproServiceStarted } = useAuthentication();

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
            getPullRequest(Number(pr.githubId), githubPath),
            getPullRequestComments(Number(pr.githubId), githubPath)
      ]);
      pr.isMergeable =
            getPr?.data?.mergeable && getPr?.data?.mergeable_state === "clean";
      pr.merged = getPr?.data?.merged;
      pr.comments = getComments?.data as any;
      return pr;
    });

    return Promise.all(mapPr);
  },
    []);

  const updateIssue = useCallback(async (repoId: string | number, ghId: string | number): Promise<IActiveIssue> => {
    const issue = await getIssue(repoId, ghId, activeNetwork?.name);
    if (!issue) throw new Error("Issue not found");

    const ghPath = issue.repository.githubPath;

    if (issue?.pullRequests?.length > 0) {
      issue.pullRequests = await updatePullRequests(issue?.pullRequests,
                                                    ghPath);
    }
    const { data: comments } = await getIssueComments(+issue.githubId,
                                                      ghPath);
    const newActiveIssue = {
        ...issue,
        comments,
        lastUpdated: +new Date()
    } as IActiveIssue;

    setActiveIssue(newActiveIssue);

    return newActiveIssue;
  },
    [activeNetwork]);

  const getNetworkIssue = useCallback(async () => {
    if (!wallet?.address || !activeIssue?.issueId || !beproServiceStarted)
      return;

    const network = await BeproService.network.getIssueByCID(activeIssue?.issueId);

    let isDraft = null;

    try {
      isDraft = await BeproService.network.isIssueInDraft(network?._id);
    } catch (error) {
      console.error(error);
    }
    const networkProposals: INetworkProposal[] = [];

    for (const meta of activeIssue.mergeProposals) {
      const { scMergeId, id: proposalId, issueId } = meta;

      if (scMergeId) {
        const [merge, disputedValue, isMergeDisputed] = await Promise.all([
          BeproService.network.getMergeById(+network?._id, +scMergeId),
          fromSmartContractDecimals(await BeproService.network.disputesForMergeByAddress(issueId, +scMergeId, wallet.address)),
          await BeproService.network.isMergeDisputed(+network?._id, +scMergeId)
        ])
        
        const isDisputed = [
          activeIssue?.merged && activeIssue?.merged !== scMergeId,
          isMergeDisputed,
        ].some(v=>v)
        
        const canUserDispute = [
          disputedValue === 0,
          isDisputed,
        ].some(v=>v)

        networkProposals[proposalId] = {
          ...merge,
          isDisputed,
          canUserDispute
        };
      }
    }

    setNetworkIssue({ ...network, isDraft, networkProposals });
    return { ...network, isDraft, networkProposals };
  }, [activeIssue, wallet, beproServiceStarted]);

  useEffect(() => {
    if (activeIssue && wallet?.address && beproServiceStarted) {
      getNetworkIssue();
    }
  }, [activeIssue, wallet?.address, beproServiceStarted]);

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
  }, [query, activeNetwork]);

  useEffect(() => {
    console.warn('useIssue',{activeIssue, networkIssue})
  }, [activeIssue, networkIssue]);

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
