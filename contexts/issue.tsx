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
import { ApplicationContext } from './application';

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
  isDraft: boolean;
  tokensStaked: string;
}

export interface IssueContextData {
  activeIssue: IActiveIssue;
  networkIssue: INetworkIssue;
  updateIssue: (repoId: string, ghId: string)=> Promise<IActiveIssue>;
  getNetworkIssue: ()=> void;
}


const IssueContext = createContext<IssueContextData>({} as IssueContextData);

export const IssueProvider: React.FC = function ({ children }) {
  
  const [activeIssue, setActiveIssue] = useState<IActiveIssue>();
  const [networkIssue, setNetworkIssue] = useState<INetworkIssue>();


  const {getIssue} = useApi()
  const {query} = useRouter();
  const {getIssueComments, getPullRequest} = useOctokit();
  // Move currentAdress and githubLogin to UserHook
  const { state: { currentAddress, githubLogin }} = useContext(ApplicationContext);

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
    if(!currentAddress || !activeIssue?.issueId) return;
    const network = await BeproService.network.getIssueByCID({ issueCID: activeIssue?.issueId })
    let isDraft = null;
    try {
      isDraft = await BeproService.network.isIssueInDraft({ issueId: network?._id })  
    } catch (error) {
      console.error({error})
    }
    
    setNetworkIssue({...network, isDraft})
    return network;
  },[activeIssue, currentAddress])

  useEffect(()=>{
    if(activeIssue && currentAddress){
      getNetworkIssue()
    }
  },[activeIssue, currentAddress])

  useEffect(()=>{
    if(query.id && query.repoId) {
      setActiveIssue(null);
      updateIssue(`${query.repoId}`,`${query.id}`)
    };
  },[query])

  useEffect(()=>{
    console.log('useIssue',{activeIssue, networkIssue})
  },[activeIssue, networkIssue])

  const memorizeValue = useMemo<IssueContextData>(
    () => ({
      activeIssue,
      networkIssue,
      updateIssue,
      getNetworkIssue
    }),
    [activeIssue, networkIssue, updateIssue, getNetworkIssue]
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
