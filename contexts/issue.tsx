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

export interface IActiveIssue extends IssueData{
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
  activeIssue: IActiveIssue;
  networkIssue: INetworkIssue;
  updateIssue: (repoId: string, ghId: string)=> Promise<IActiveIssue>
}


const IssueContext = createContext<IssueContextData>({} as IssueContextData);

export const IssueProvider: React.FC = function ({ children }) {
  
  const [activeIssue, setActiveIssue] = useState<IActiveIssue>();
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

  async function updateIssue(repoId: string, ghId: string): Promise<IActiveIssue> {
    setActiveIssue(null)
    
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
    const newActiveIssue = {
      ...issue,
      comments,
    } as IActiveIssue;

    setActiveIssue(newActiveIssue);

    return newActiveIssue;
  }

  const getNetworkIssue = useCallback(async () => {
    const issueCID = `${activeIssue.repository_id}/${activeIssue.id}`
    const network = await BeproService.network.getIssueByCID({ issueCID })
    setNetworkIssue(network)
    return network;
  },[activeIssue])

  useEffect(()=>{
    if(activeIssue){
      getNetworkIssue()
    }
  },[activeIssue])

  useEffect(()=>{
    if(query.id && query.repoId) updateIssue(`${query.repoId}`,`${query.id}`);
  },[query])

  useEffect(()=>{
    console.log('useIssue',{activeIssue, networkIssue})
  },[activeIssue, networkIssue])

  const memorizeValue = useMemo<IssueContextData>(
    () => ({
      activeIssue,
      networkIssue,
      updateIssue
    }),
    [activeIssue, networkIssue, updateIssue]
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
