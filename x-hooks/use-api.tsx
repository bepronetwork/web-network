import axios from 'axios';
import {API} from '../env';
import {useEffect, useState} from 'react';
import {IssueData} from '@interfaces/issue-data';
import {ProposalData, User} from '@services/github-microservice';
import {ReposList} from '@interfaces/repos-list';

const client = axios.create({baseURL: `http://localhost:3000`});
client.interceptors.response.use(
  undefined,
  error => { console.debug(`Failed`, error); return error; })

interface Paginated<T = any> {
  count: number;
  rows: T[]
}

const repoList: ReposList = [];

export default function useApi() {

  async function getIssues(page = '1',
                           repoId = '',
                           time = ``,
                           state = ``,
                           sortBy = 'updatedAt',
                           order = 'DESC') {
    const search = new URLSearchParams({page, repoId, time, state, sortBy, order}).toString();
    return client.get<{rows: IssueData[], count: number}>(`/api/issues/?${search}`)
                 .then(({data}) => data)
                 .catch(() => ({rows: [], count: 0}));
  }

  async function getIssue(repoId: string, ghId: string) {
    return client.get<IssueData>(`/api/issue/${repoId}/${ghId}`)
                 .then(({data}) => data)
                 .catch(() => null);
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

  async function getMergeProposalOf(mergeId: string, issueId: string) {
    return client.get<ProposalData>(`/api/issue/merge/${mergeId}/${issueId}`)
                 .then(({data}) => data)
                 .catch(() => ({scMergeId: '', pullRequestId: '', issueId: '', id: ''}))
  }

  async function createPullRequestIssue(repoId: string, issueGitId: string, payload: {title: string; description: string; username: string;}) {
    return client.post(`/api/issue/pull/${repoId}/${issueGitId}`, payload)
                 .then(() => true)
                 .catch(() => false)
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
    return client.patch<string>(`/api/users/connect/${githubHandle}`, payload)
                 .then(() => true)
                 .catch((error) => {
                   if (error.response)
                     return error.response.data;

                   return `Unknown error. Check logs.`;
                 });
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

  async function getAllUsers() {
    return client.get<User[]>(`/api/search/users/`)
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

  async function waitForMerge(login, scId, ghPrId) {
    return client.get(`/api/poll/merge/${login}/${scId}/${ghPrId}`)
                 .then(({data}) => data)
                 .catch(() => null)
  }

  async function health() {
    return client.get(`/api/health`)
                 .then(({status}) => status === 200)
                 .catch(e => {
                   console.error(`Failed to get health`, e);
                   return false;
                 });
  }

  return {getIssue, getReposList, getIssues}
}
