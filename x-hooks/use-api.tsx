import axios from 'axios';
import {IssueData} from '@interfaces/issue-data';
import {ProposalData, User} from '@services/github-microservice';
import {ReposList} from '@interfaces/repos-list';

const client = axios.create({baseURL: process.env.NEXT_API_HOST});
client.interceptors.response.use(
  undefined,
  error => { console.debug(`Failed`, error); throw error; })

interface Paginated<T = any> {
  count: number;
  rows: T[]
}

interface NewIssueParams {
  title: string,
  description: string,
  amount: number,
  creatorAddress: string,
  creatorGithub: string,
  repository_id: string,
}

const repoList: ReposList = [];

export default function useApi() {

  async function getIssues(page = '1',
                           repoId = '',
                           time = ``,
                           state = ``,
                           sortBy = 'updatedAt',
                           order = 'DESC',
                           address = ``,
                           creator = ``) {
    const search = new URLSearchParams({address, page, repoId, time, state, sortBy, order, creator}).toString();
    return client.get<{rows: IssueData[], count: number}>(`/api/issues/?${search}`)
                 .then(({data}) => data)
                 .catch(() => ({rows: [], count: 0}));
  }

  async function getIssue(repoId: string, ghId: string) {
    return client.get<IssueData>(`/api/issue/${repoId}/${ghId}`)
                 .then(({data}) => data)
                 .catch(() => null);
  }

  async function createIssue(payload: NewIssueParams) {
    return client.post<number>(`/api/issue`, payload)
                 .then(({data}) => data)
                 .catch(() => null);
  }

  async function moveIssueToOpen(scIssueId?: string) {
    return client.post(`/api/past-events/move-to-open`, {scIssueId})
                 .then(({data}) => data)
                 .catch(() => null);
  }


  async function patchIssueWithScId(repoId, githubId, scId) {
    return client.patch(`/api/issue`, {repoId, githubId, scId})
                 .then(({data}) => data === `ok`)
                 .catch(_ => false)
  }

  async function getIssuesOfLogin(login: string, page = '1') {
    const search = new URLSearchParams({page, creator: login}).toString();
    return client.get<IssueData>(`/api/issues/?${search}`)
                 .then(({data}) => data)
                 .catch(() => null);
  }

  async function getPendingFor(address: string, page = '1') {
    const search = new URLSearchParams({address, page, state: `pending`}).toString()
    return client.get<IssueData[]>(`/api/issues/?${search}`)
                 .then(({data}) => data)
                 .catch(() => null);
  }

  async function getMergeProposal(dbId: string,) {
    return client.get<ProposalData>(`/api/merge-proposal/${dbId}/`)
                 .then(({data}) => data)
                 .catch(() => ({scMergeId: '', pullRequestId: '', issueId: '', id: ''}))
  }

  async function createPullRequestIssue(repoId: string, githubId: string, payload: {title: string; description: string; username: string;}) {
    return client.post(`/api/pull-request/`, {...payload, repoId, githubId})
                 .then(() => true)
                 .catch((error) => {
                   throw error
                 })
  }
  async function getPullRequestIssue(issueId: string) {
    const search = new URLSearchParams({issueId}).toString();
    return client.get<boolean>(`/api/pull-request?${search}`)
                 .then(({data}) => data)
                 .catch(e => {
                   console.log(`Failed to fetch PR information`, e);
                   return false;
                 });
  }

  async function createGithubData(payload: {githubHandle: string, githubLogin: string, accessToken: string}): Promise<boolean> {
    return client.post<string>(`/api/users/connect`, payload)
                 .then(({data, status}) => {
                   return data === `ok`
                 })
                 .catch((error) => {
                   if (error.response?.status === 302)
                     return true;

                   if (error.response?.data)
                     return error.response?.data;

                   return false;
                 });
  }

  async function joinAddressToUser(githubHandle: string, payload: {address: string, migrate?: boolean}): Promise<boolean> {
    return client.patch<string>(`/api/user/connect/${githubHandle}`, payload)
                 .then(() => true)
                 .catch((error) => {
                   if (error.response)
                     return error.response.data;

                   return `Unknown error. Check logs.`;
                 });
  }

  async function getUserWith(login: string): Promise<User> {
    return client.post<User[]>(`/api/search/users/login/`, [login])
                 .then(({data}) => data[0])
                 .catch(() => ({} as User))
  }

  async function getUserOf(address: string): Promise<User> {
    return client.post<User[]>(`/api/search/users/address/`, [address])
                 .then(({data}) => data[0])
                 .catch(() => ({} as User))
  }

  async function getAddressesOf(users: string[]) {
    if (!users.length)
      return [];

    return client.post<User[]>(`/api/search/users/login`, users)
                 .then(({data}) => data)
                 .catch(_ => [])
  }

  async function setIssueGitHubId(issueGitId: string, scIssueId) {
    return client.patch(`/api/issue/scId/${issueGitId}/${scIssueId}`)
                 .then(({data}) => data === `ok`)
                 .catch(() => false)
  }

  async function getAllUsers(payload: {page: number,} = {page: 1}) {
    return client.post<User[]>(`/api/search/users/`, payload)
                 .then(({data}) => data)
                 .catch(() => []);
  }

  async function createRepo(owner, repo) {
    return client.post(`/api/repos/`, {owner, repo})
                 .then(({status}) => status === 200)
                 .catch((e) => {
                   console.error(`Failed to create repo`, e)
                   return false;
                 })
  }

  async function getReposList(force = false) {
    if (!force && repoList.length)
      return Promise.resolve(repoList as ReposList);

    return client.get<ReposList>(`/api/repos/`)
                 .then(({data}) => data)
                 .catch(() => []);
  }

  async function removeRepo(id: string) {
    return client.delete(`/api/repos/${id}`)
                 .then(({status}) => status === 200)
                 .catch(() => false);
  }

  async function waitForMerge(githubLogin, issue_id, currentGithubId) {
    return client.get(`/api/poll/mergeProposal/${githubLogin}/${issue_id}/${currentGithubId}`)
                 .then(({data}) => data)
                 .catch(() => null)
  }

  async function waitForClose(currentGithubId) {
    return client.get(`/api/poll/closeIssue/${currentGithubId}`)
                 .then(({data}) => data)
                 .catch(() => null)
  }

  async function waitForRedeem(currentGithubId) {
    return client.get(`/api/poll/redeemIssue/${currentGithubId}`)
                 .then(({data}) => data)
                 .catch(() => null)
  }

  async function processEvent(eventName, fromBlock: number, id: number) {
    return client.post(`/api/past-events/${eventName}/`, {fromBlock, id})
  }

  async function processMergeProposal(fromBlock, id) {
    return client.post(`/api/past-events/merge-proposal/`, {fromBlock, id})
  }

  async function getHealth() {
    return client.get(`/api/health`)
                 .then(({status}) => status === 204)
                 .catch(e => false);
  }

  async function getClientNation() {
    return client.get(`/api/ip`)
                 .then(({data}) => data || ({countryCode: `US`, country: ``}))
                 .catch(e => {
                   return ({countryCode: `US`, country: ``})
                 });
  }

  async function userHasPR(issueId: string, login: string) {
    const search = new URLSearchParams({issueId, login}).toString();
    return client.get<boolean>(`/api/pull-request?${search}`)
                 .then(({data}) => !!data)
                 .catch(e => {
                   console.log(`Failed to fetch PR information`, e);
                   return false;
                 });

  }
  
  async function createRepoFork(repoPath: string) {
    return client.post('/api/forks', {repoPath})
                .then(() => true)
                .catch(error => {
                  throw error
                })
  }

  async function startWorking(issueId: string, githubLogin: string) {
    return client.put('/api/issue/working',  { issueId, githubLogin })
                .then((response) => response)
                .catch(error => {
                  throw error
                })
  }

  return {
    getIssue,
    getReposList,
    getIssues,
    getHealth,
    getClientNation,
    getUserOf,
    getUserWith,
    getPendingFor,
    createPullRequestIssue,
    getPullRequestIssue,
    createIssue,
    moveIssueToOpen,
    patchIssueWithScId,
    waitForMerge,
    processMergeProposal,
    processEvent,
    getMergeProposal,
    joinAddressToUser,
    getAllUsers,
    createRepo,
    removeRepo,
    waitForClose,
    waitForRedeem,
    userHasPR,
    createRepoFork,
    startWorking,
  }
}
