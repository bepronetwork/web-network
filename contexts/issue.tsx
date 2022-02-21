import React, {
  createContext,
  useCallback,
  useState,
  useContext,
  useMemo,
  useEffect
} from 'react';

import { IssueData, CID ,pullRequest, Comment } from '@interfaces/issue-data';
import { BeproService } from '@services/bepro-service';

import useApi from '@x-hooks/use-api';
import useOctokit from '@x-hooks/use-octokit';
import {useRouter} from 'next/router';

export interface ICurrentIssue extends IssueData{
  comments: Comment[]
}

export interface INetworkIssue{
  _id: string
  canceled: boolean;
  cid: CID;
  creationDate: Date;
  finalized: boolean;
  issueGenerator: string;
  mergeProposalsAmount: number
  recognizedAsFinished: boolean;
  tokensStaked: string;
}

export interface IssueContextData {
  currentIssue: ICurrentIssue;
  networkIssue: INetworkIssue;
  updateIssue: (repoId: string, ghId: string)=> Promise<ICurrentIssue>
}


const IssueContext = createContext<IssueContextData>({} as IssueContextData);

export const IssueProvider: React.FC = function ({ children }) {
  
  const [currentIssue, setCurrentIssue] = useState<ICurrentIssue>();
  const [networkIssue, setNetworkIssue] = useState<INetworkIssue>();


  const {getIssue} = useApi()
  const {query} = useRouter();
  const {getIssueComments, getPullRequest} = useOctokit();

  const updatePullRequests = useCallback(async(prs: pullRequest[], githubPath: string)=>{
    const mapPr = prs.map(async(pr)=>{
      const {data} = await getPullRequest(Number(pr.githubId), githubPath)
      pr.isMergeable = data.mergeable;
      pr.merged = data.merged;
      return pr;
    })

    return await Promise.all(mapPr);
  },[])

  async function updateIssue(repoId: string, ghId: string): Promise<ICurrentIssue> {
    setCurrentIssue(null)
    
    const issue = await getIssue(repoId, ghId);
    
    if(!issue) throw new Error(`Issue not found`);
    

    const ghPath = issue.repository.githubPath;

    if (issue?.pullRequests?.length > 0) {
      issue.pullRequests = await updatePullRequests(
        issue?.pullRequests,
        ghPath
      );
    }
    const { data: comments } = await getIssueComments(+issue.githubId, ghPath);
    const newCurrentIssue = {
      ...issue,
      comments,
    } as ICurrentIssue;

    setCurrentIssue(newCurrentIssue);

    return newCurrentIssue;
  }

  const getNetworkIssue = useCallback(async () => {
    const issueCID = `${currentIssue.repository_id}/${currentIssue.id}`
    const network = await BeproService.network.getIssueByCID({ issueCID })
    setNetworkIssue(network)
    return network;
  },[currentIssue])

  useEffect(()=>{getNetworkIssue},[currentIssue])
  useEffect(()=>{
    if(query.id && query.repoId) updateIssue(`${query.repoId}`,`${query.id}`);
  },[query])

  const memorizeValue = useMemo<IssueContextData>(
    () => ({
      currentIssue,
      networkIssue,
      updateIssue
    }),
    [currentIssue, updateIssue]
  );

  return (
    <IssueContext.Provider value={memorizeValue}>
      {children}
    </IssueContext.Provider>
  );
};

export function useIssue(): IssueContextData {
  const context = useContext(IssueContext);

  if (!context) {
    throw new Error('useIssue must be used within an IssueProvider');
  }

  return context;
}
