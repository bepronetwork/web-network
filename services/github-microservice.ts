import axios from 'axios';
import {IssueData} from '../interfaces/issue-data';
import { API } from '../env';

interface User {
  githubHandle: string;
  githubLogin: string;
  address: string;
  createdAt: string;
  id: number;
  updatedAt: string;
}

const client = axios.create({baseURL: API});

export default class GithubMicroService {

  static async createIssue(payload) {
    await client.post('/issues', payload);
  }
  static async getIssuesIds(issueIds) {
    const {data} = await client.get('/issues', {params: {issueIds}});
    return data;
  }

  static async getIssues() {
    const {data} = await client.get('/issues');
    return data;
  }

  static async getIssuesState(state: any) {
    const {data} =  await client.get('/issues', state);
    return data;
  }

  static async getIssueId(issueId: string | string[]) {
    const {data} = await client.get(`/issues/${issueId}`);
    return data;
  }

  static async getCommentsIssue(githubId: string | string[]) {
    const {data} = await client.get(`/issues/github/${githubId}/comments`);
    return data;
  }

  /**
   * Should merge the address and the github handle
   */
  static joinAddressToHandle(payload: {address: string, githubHandle: string, githubLogin: string}): Promise<boolean> {
    return client.post<string>(`/users/connect`, payload)
                 .then(({data}) => data === `ok`)
                 .catch((error) => {
                   console.log(`Error`, error)
                   return false;
                 });
  }

  /**
   * Should return user of address
   */
  static async getUserOf(address: string): Promise<User> {
    return client.get<User>(`/users/address/${address}`)
                 .then(({data}) => data)
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
    return client.get<{openIssues: number, beproStaked: number, tokensStaked: number, closedIssues?: number}>(`/networkstatus`)
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

  static async createMergeProposal(id: string) {
    return client.post<'ok'>(`/issues/${id}/mergeproposal`)
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
}
