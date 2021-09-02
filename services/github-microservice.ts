import axios from 'axios';
import {IssueData, IssueState} from '@interfaces/issue-data';
import { API } from '../env';

export interface User {
  githubHandle: string;
  githubLogin: string;
  address?: string;
  createdAt: string;
  id: number;
  updatedAt: string;
}

export interface ProposalData {
  id: number;
  issueId: number;
  scMergeId: string;
  pullRequestId: number;
  pullRequest: {
    id: number;
    githubId: string;
    issueId: number;
    createdAt: string;
    updatedAt: string;
  };
  createdAt: string;
  updatedAt: string;
}

const client = axios.create({baseURL: API});

export default class GithubMicroService {

  static async createIssue(payload) {
    return client.post('/issues', payload)
                 .then(({data}) => data === `ok`)
                 .catch(e => {
                   console.error(`Error creating issue`, e);
                   return null;
                 });
  }

  static async getIssuesIds(issueIds) {
    const {data} = await client.get('/issues', {params: {issueIds}});
    return data;
  }

  static async getIssues() {
    const {data} = await client.get('/issues/');
    return data;
  }

  static async getIssuesState(filterState: IssueState) {
    const {data} =  await client.get('/issues',{params: {filterState}});
    return data;
  }

  static async getIssueId(issueId: string | string[]) {
    return client.get(`/issues/${issueId}`)
                 .then(({data}) => data)
                 .catch(e => {
                   console.error(`Error fetchin issue`, e);
                   return null;
                 });
  }

  static async getCommentsIssue(githubId: string | string[]) {
    const {data} = await client.get(`/issues/github/${githubId}/comments`);
    return data;
  }

  static async createGithubData(payload: {githubHandle: string, githubLogin: string}): Promise<boolean> {
    return client.post<string>(`/users/connect`, payload)
                 .then(({data}) => data === `ok`)
                 .catch((error) => {
                   console.error(`createGithubData Error`, error)
                   return false;
                 });
  }

  static async joinAddressToUser(githubHandle: string,payload: {address: string}): Promise<boolean> {
    return client.patch<string>(`/users/connect/${githubHandle}`, payload)
                 .then(() => true)
                 .catch((error) => {
                   console.error(`joinAddressToUser Error`, error)
                   return false;
                 });
  }

  /**
   * Should return user of address
   */
  static async getUserOf(address: string): Promise<User> {
    return client.get<User>(`/users/address/${address}`)
                 .then(({data}) => data)
                 .catch(e => {
                   console.error(`Failed to fetch user with address ${address}`, e);
                   return {} as User;
                 })
  }

  /**
   * Should return the handle of a given wallet address
   */
  static async getHandleOf(address: string): Promise<any> {
    return GithubMicroService.getUserOf(address).then((data) => data?.githubHandle || ``).catch( _ => ``);
  }

  static async createPullRequestIssue(issueId: string | string[], payload) {
    await client.post(`/issues/${issueId}/pullrequest`, payload);
  }

  static async startWorkingIssue(issueId: string | string[], payload) {
    await client.post(`developers/working/${issueId}`, payload);
  }

  /**
   * Should return network status
   */
  static async getNetworkStats() {
    return client.get<{openIssues: number, beproStaked: number, tokensStaked: number, closedIssues?: number}>(`/networkstats`)
                 .then(({data}) => data)
                 .catch(e => {
                   console.error(e);
                   return {openIssues: 0, beproStaked: 0, tokensStaked: 0, closedIssues: 0}
                 });
  }

  static async getPullRequestParticipants(prId: string) {
    return client.get<{githubHandle: string; address?: string}[]>(`/pullrequests/${prId}/participants`)
                 .then(({data}) => data)
                 .catch(e => {
                   console.error(e);
                   return [{githubHandle: '', address: ''}];
                 })
  }

  static async getPullRequestsOfIssue(id: string): Promise<IssueData|null> {
    return client.get<IssueData>(`/issues/issue/${id}`)
                 .then(({data}) => data)
                 .catch(e => {
                   console.error(e);
                   return null;
                 })
  }

  static async createMergeProposal(id: string, payload: { pullRequestGithubId: string, scMergeId: string}) {
    return client.post<'ok'>(`/issues/${id}/mergeproposal`, payload)
                 .then(({data}) => data === 'ok')
                 .catch(e => {
                   console.error(e);
                   return false;
                 });
  }

  static async getForks() {
    return client.get(`/forks`)
                 .then(({data}) => data)
                 .catch(e => {
                   console.error(e);
                   return null;
                 })
  }
  static async getMergeProposalIssue(issueId: string | string[], MergeId: string | string[]) {
    return client.get<ProposalData>(`/issues/mergeproposal/${MergeId}/${issueId}`)
                 .then(({data}) => data)
                 .catch(e => {
                   console.error(e);
                   return {scMergeId: '', pullRequestId: '', issueId: '', id: ''}
                 })
  }

  static async getHealth() {
    return client.get(`/`)
                 .then(({status}) => status === 200)
                 .catch(e => {
                   console.error(e);
                   return false;
                 });
  }
}
