import axios from "axios";
import {
  BEPRO_NETWORK_NAME,
  CURRENCY_API,
  CURRENCY_ID
} from "env";
import { head } from "lodash";

import { User } from "interfaces/api-response";
import { BranchInfo, BranchsList } from "interfaces/branchs-list";
import { IssueData, pullRequest } from "interfaces/issue-data";
import { INetwork } from "interfaces/network";
import { PaginatedData } from "interfaces/paginated-data";
import { Proposal } from "interfaces/proposal";
import { ReposList } from "interfaces/repos-list";

import client from "services/api";

interface Paginated<T = any> {
  count: number;
  rows: T[];
}

interface NewIssueParams {
  title: string;
  description: string;
  amount: number;
  creatorAddress: string;
  creatorGithub: string;
  repository_id: string;
}

const repoList: ReposList = [];
const branchsList: BranchsList = {};

export default function useApi() {
  async function getIssues(page = "1",
                           repoId = "",
                           time = "",
                           state = "",
                           sortBy = "updatedAt",
                           order = "DESC",
                           address = "",
                           creator = "",
                           networkName = BEPRO_NETWORK_NAME) {
    const search = new URLSearchParams({
      address,
      page,
      repoId,
      time,
      state,
      sortBy,
      order,
      creator,
      networkName
    }).toString();
    return client
      .get<{ rows: IssueData[]; count: number }>(`/issues/?${search}`)
      .then(({ data }) => data)
      .catch(() => ({ rows: [], count: 0 }));
  }

  async function searchIssues({
    page = "1",
    repoId = "",
    time = "",
    state = "",
    sortBy = "updatedAt",
    order = "DESC",
    address = "",
    creator = "",
    search = "",
    pullRequester = "",
    networkName = BEPRO_NETWORK_NAME
  }) {
    const params = new URLSearchParams({
      address,
      page,
      repoId,
      time,
      state,
      sortBy,
      order,
      creator,
      search,
      pullRequester,
      networkName
    }).toString();
    return client
      .get<{
        rows: IssueData[];
        count: number;
        pages: number;
        currentPage: number;
      }>(`/search/issues/?${params}`)
      .then(({ data }) => data)
      .catch(() => ({ rows: [], count: 0, pages: 0, currentPage: 1 }));
  }

  async function searchRepositories({
    page = "1",
    owner = "",
    name = "",
    path = "",
    networkName = BEPRO_NETWORK_NAME
  }) {
    const params = new URLSearchParams({
      page,
      owner,
      name,
      path,
      networkName
    }).toString();
    return client
      .get<{ rows; count: number; pages: number; currentPage: number }>(`/search/repositories?${params}`)
      .then(({ data }) => data)
      .catch(() => ({ rows: [], count: 0, pages: 0, currentPage: 1 }));
  }

  async function getIssue(repoId: string | number, 
                          ghId: string | number,
                          networkName = BEPRO_NETWORK_NAME) {
    return client
      .get<IssueData>(`/issue/${repoId}/${ghId}/${networkName}`)
      .then(({ data }) => data)
      .catch(() => null);
  }

  async function createIssue(payload: NewIssueParams,
                             networkName = BEPRO_NETWORK_NAME) {
    return client
      .post<number>("/issue", { ...payload, networkName })
      .then(({ data }) => data)
      .catch(() => null);
  }

  async function moveIssueToOpen(scIssueId?: string) {
    return client
      .post("/past-events/move-to-open", { scIssueId })
      .then(({ data }) => data)
      .catch(() => null);
  }

  async function patchIssueWithScId(repoId,
                                    githubId,
                                    scId,
                                    networkName = BEPRO_NETWORK_NAME) {
    return client
      .patch("/issue", { repoId, githubId, scId, networkName })
      .then(({ data }) => data === "ok")
      .catch((_) => false);
  }

  async function getPendingFor(address: string,
                               page = "1",
                               networkName = BEPRO_NETWORK_NAME) {
    const search = new URLSearchParams({
      address,
      page,
      state: "pending",
      networkName
    }).toString();
    return client
      .get<IssueData[]>(`/issues/?${search}`)
      .then(({ data }) => data)
      .catch(() => null);
  }

  async function createPullRequestIssue(repoId: string,
                                        githubId: string,
                                        payload: {
      title: string;
      description: string;
      username: string;
      branch: string;
    },
                                        networkName = BEPRO_NETWORK_NAME) {
    return client
      .post("/pull-request/", { ...payload, repoId, githubId, networkName })
      .then(() => true)
      .catch((error) => {
        throw error;
      });
  }

  async function getPullRequestIssue(issueId: string, page = "1") {
    const search = new URLSearchParams({ issueId, page }).toString();
    return client
      .get<PaginatedData<pullRequest>>(`/pull-request?${search}`)
      .then(({ data: { rows } }) => head(rows))
      .catch((e) => {
        console.log("Failed to fetch PR information", e);
        return null;
      });
  }

  async function joinAddressToUser(githubHandle: string,
                                   payload: { address: string; migrate?: boolean }): Promise<boolean> {
    return client
      .patch<string>(`/user/connect/${githubHandle}`, payload)
      .then(() => true)
      .catch((error) => {
        if (error.response) return error.response.data;

        return "Unknown error. Check logs.";
      });
  }

  async function getUserWith(login: string): Promise<User> {
    return client
      .post<User[]>("/search/users/login/", [login])
      .then(({ data }) => data[0] || ({} as User))
      .catch(() => ({} as User));
  }

  async function getTotalUsers(): Promise<number> {
    return client.get<number>("/search/users/total").then(({ data }) => data);
  }
  
  async function getTotalBounties(state: string, networkName = BEPRO_NETWORK_NAME): Promise<number> {
    const search = new URLSearchParams({ state, networkName }).toString();
    return client.get<number>(`/search/issues/total?${search}`).then(({ data }) => data);
  }

  async function getAllUsers(payload: { page: number } = { page: 1 }) {
    return client
      .post<User[]>("/search/users/all", payload)
      .then(({ data }) => data)
      .catch(() => []);
  }

  async function createRepo(owner, repo, networkName = BEPRO_NETWORK_NAME) {
    return client
      .post("/repos/", { owner, repo, networkName })
      .then(({ status }) => status === 200)
      .catch((e) => {
        console.error("Failed to create repo", e);
        return false;
      });
  }

  async function getReposList(force = false, networkName = BEPRO_NETWORK_NAME) {
    const search = new URLSearchParams({ networkName }).toString();

    if (!force && repoList.length)
      return Promise.resolve(repoList as ReposList);

    return client
      .get<ReposList>(`/repos?${search}`)
      .then(({ data }) => data)
      .catch(() => []);
  }

  async function getBranchsList(repoId: string | number,
                                force = false,
                                networkName = BEPRO_NETWORK_NAME) {
    if (!force && branchsList[repoId]?.length)
      return Promise.resolve(branchsList[repoId] as BranchInfo[]);

    return client
      .get<BranchInfo[]>(`/repos/branchs/${repoId}/${networkName}`)
      .then(({ data }) => {
        branchsList[repoId] = data;
        return data;
      })
      .catch(() => []);
  }

  async function removeRepo(id: string) {
    return client
      .delete(`/repos/${id}`)
      .then(({ status }) => status === 200)
      .catch(() => false);
  }

  async function poll(eventName: string,
                      rest,
                      networkName = BEPRO_NETWORK_NAME) {
    return client.post("/poll/",
      { eventName, ...rest, networkName },
      { timeout: 2 * 60 * 1000 });
  }

  async function waitForMerge(githubLogin,
                              issue_id,
                              currentGithubId,
                              networkName = BEPRO_NETWORK_NAME) {
    return poll("mergeProposal",
      { githubLogin, issue_id, currentGithubId },
                networkName)
      .then(({ data }) => data)
      .catch(() => null);
  }

  async function waitForClose(currentGithubId,
                              networkName = BEPRO_NETWORK_NAME) {
    return poll("closeIssue", { currentGithubId }, networkName)
      .then(({ data }) => data)
      .catch(() => null);
  }

  async function waitForRedeem(currentGithubId,
                               networkName = BEPRO_NETWORK_NAME) {
    return poll("redeemIssue", { currentGithubId }, networkName)
      .then(({ data }) => data)
      .catch(() => null);
  }

  async function processEvent(eventName,
                              fromBlock: number,
                              id: number,
                              params?: object,
                              networkName = BEPRO_NETWORK_NAME) {
    return client.post(`/past-events/${eventName}/`, {
      fromBlock,
      id,
      ...params,
      networkName
    });
  }

  async function processMergeProposal(fromBlock, id) {
    return client.post("/past-events/merge-proposal/", { fromBlock, id });
  }

  async function getHealth() {
    return client
      .get("/health")
      .then(({ status }) => status === 204)
      .catch((e) => false);
  }

  async function getClientNation() {
    return client
      .get("/ip")
      .then(({ data }) => data || { countryCode: "US", country: "" })
      .catch((e) => {
        return { countryCode: "US", country: "" };
      });
  }

  async function userHasPR(issueId: string,
                           login: string,
                           networkName = BEPRO_NETWORK_NAME) {
    const search = new URLSearchParams({
      issueId,
      login,
      page: "1",
      networkName
    }).toString();
    return client
      .get<PaginatedData<pullRequest>>(`/pull-request?${search}`)
      .then(({ data: { count } }) => count > 0)
      .catch((e) => {
        console.log("Failed to fetch PR information", e);
        return false;
      });
  }

  async function getUserPullRequests(page = "1",
                                     login: string,
                                     networkName = BEPRO_NETWORK_NAME) {
    const search = new URLSearchParams({ page, login, networkName }).toString();

    return client
      .get<PaginatedData<pullRequest>>(`/pull-request?${search}`)
      .then(({ data }) => data)
      .catch((e) => {
        console.log("Failed to fetch PR information", e);
        return false;
      });
  }

  async function startWorking(issueId: string,
                              githubLogin: string,
                              networkName = BEPRO_NETWORK_NAME) {
    return client
      .put("/issue/working", { issueId, githubLogin, networkName })
      .then((response) => response)
      .catch((error) => {
        throw error;
      });
  }

  async function mergeClosedIssue(issueId: string,
                                  pullRequestId: string,
                                  mergeProposalId: string,
                                  address: string,
                                  networkName = BEPRO_NETWORK_NAME) {
    return client
      .post("/pull-request/merge", {
        issueId,
        pullRequestId,
        mergeProposalId,
        address,
        networkName
      })
      .then((response) => response)
      .catch((error) => {
        throw error;
      });
  }

  async function createReviewForPR(issueId: string,
                                   pullRequestId: string,
                                   githubLogin: string,
                                   body: string,
                                   networkName = BEPRO_NETWORK_NAME) {
    return client
      .put("/pull-request/review", {
        issueId,
        pullRequestId,
        githubLogin,
        body,
        networkName
      })
      .then((response) => response);
  }

  async function removeUser(address: string, githubLogin: string) {
    return client
      .delete(`/user/${address}/${githubLogin}`)
      .then(({ status }) => status === 200);
  }

  async function createNetwork(networkInfo) {
    return client
      .post("/network", { ...networkInfo })
      .then((response) => response)
      .catch((error) => {
        throw error;
      });
  }

  async function uploadFiles(files: File | File[]): Promise<any[]> {
    const form = new FormData();
    const isArray = Array.isArray(files);
    if (isArray) {
      files?.forEach(async (file, index) => {
        form.append(`file${index + 1}`, file);
      });
    } else {
      form.append("file", files);
    }

    return client.post("/files", form).then(({ data }) => data);
  }

  async function updateNetwork(networkInfo) {
    return client
      .put("/network", { ...networkInfo })
      .then((response) => response)
      .catch((error) => {
        throw error;
      });
  }

  async function getProposal(dbId: string | number): Promise<Proposal> {
    return client
      .get<Proposal>(`/merge-proposal/${dbId}`)
      .then(({ data }) => data)
      .catch(() => null);
  }

  async function getUserOf(address: string): Promise<User> {
    return client
      .post<User[]>("/search/users/address/", [address])
      .then(({ data }) => data[0])
      .catch(() => ({} as User));
  }

  async function isNetworkOwner(creatorAddress, networkAddress) {
    const params = new URLSearchParams({
      creatorAddress,
      networkAddress
    }).toString();

    return client
      .get<{
        rows: INetwork[];
        count: number;
        pages: number;
        currentPage: number;
      }>(`/search/networks/?${params}`)
      .then(({ data }) => !!data.rows.length)
      .catch(() => false);
  }

  async function getNetwork(name: string) {
    const search = new URLSearchParams({ name }).toString();

    return client
      .get<INetwork>(`/network?${search}`)
      .then((response) => response)
      .catch((error) => {
        throw error;
      });
  }

  async function searchNetworks({
    page = "1",
    name = "",
    creatorAddress = "",
    networkAddress = "",
    sortBy = "updatedAt",
    order = "DESC",
    search = ""
  }) {
    const params = new URLSearchParams({
      page,
      name,
      creatorAddress,
      networkAddress,
      sortBy,
      order,
      search
    }).toString();

    return client
      .get<{
        rows: INetwork[];
        count: number;
        pages: number;
        currentPage: number;
      }>(`/search/networks/?${params}`)
      .then(({ data }) => data)
      .catch(() => ({ rows: [], count: 0, pages: 0, currentPage: 1 }));
  }

  async function getCurrencyByToken(tokenId = CURRENCY_ID, comparedToken?: string) {
    const params:{ids: string, vs_currencies?: string} = {
        ids: tokenId,
    }
    
    if(comparedToken) params.vs_currencies = comparedToken

    try {
      const { data } = await axios.get(`${CURRENCY_API}/simple/price`,{
        params
      });

      return data[tokenId];
    } catch (error) {
      return {};
    }
  }

  async function repositoryHasIssues(repoPath) {
    const search = new URLSearchParams({ repoPath }).toString();

    return client
      .get<{ rows: IssueData[]; count: number }>(`/search/issues/?${search}`)
      .then(({ data }) => !!data.count)
      .catch(() => false);
  }

  return {
    createIssue,
    createNetwork,
    createPullRequestIssue,
    createRepo,
    createReviewForPR,
    getAllUsers,
    getCurrencyByToken,
    getBranchsList,
    getClientNation,
    getHealth,
    getIssue,
    getIssues,
    getNetwork,
    getPendingFor,
    getProposal,
    getPullRequestIssue,
    getReposList,
    getTotalUsers,
    getTotalBounties,
    getUserOf,
    getUserPullRequests,
    getUserWith,
    isNetworkOwner,
    joinAddressToUser,
    mergeClosedIssue,
    moveIssueToOpen,
    patchIssueWithScId,
    processEvent,
    processMergeProposal,
    removeRepo,
    removeUser,
    repositoryHasIssues,
    searchIssues,
    searchNetworks,
    searchRepositories,
    startWorking,
    updateNetwork,
    uploadFiles,
    userHasPR,
    waitForClose,
    waitForMerge,
    waitForRedeem
  };
}
