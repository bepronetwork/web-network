import { head } from "lodash";
import getConfig from "next/config";

import { PastEventsParams, User } from "interfaces/api";
import { IssueData, pullRequest } from "interfaces/issue-data";
import { Network } from "interfaces/network";
import { PaginatedData } from "interfaces/paginated-data";
import { Proposal } from "interfaces/proposal";
import { ReposList } from "interfaces/repos-list";

import client from "services/api";

import { Entities, Events } from "types/dappkit";

const { publicRuntimeConfig } = getConfig()

interface NewIssueParams {
  title: string;
  description: string;
  amount: number;
  creatorAddress: string;
  creatorGithub: string;
  repository_id: string;
}

interface CreateBounty {
  title: string;
  body: string;
  creator: string;
  repositoryId: string;
}

type FileUploadReturn = {
  hash: string;
  fileName: string;
  size: string;
}[]

const repoList: ReposList = [];

export default function useApi() {
  async function getIssues(page = "1",
                           repoId = "",
                           time = "",
                           state = "",
                           sortBy = "updatedAt",
                           order = "DESC",
                           address = "",
                           creator = "",
                           networkName = publicRuntimeConfig?.currency?.networkConfig?.networkName) {
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
    networkName = publicRuntimeConfig?.currency?.networkConfig?.networkName
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
    networkName = publicRuntimeConfig?.currency?.networkConfig?.networkName
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
                          networkName = publicRuntimeConfig?.networkConfig?.networkName) {
    return client
      .get<IssueData>(`/issue/${repoId}/${ghId}/${networkName}`)
      .then(({ data }) => data)
      .catch(() => null);
  }

  async function getPayments(address: string) {
    return client
      .get<IssueData[]>(`/payments/${address}`)
      .then(({ data }) => data)
      .catch(() => null);
  }

  async function createIssue(payload: NewIssueParams,
                             networkName = publicRuntimeConfig?.networkConfig?.networkName) {
    return client
      .post<number>("/issue", { ...payload, networkName })
      .then(({ data }) => data)
      .catch(() => null);
  }

  /**
   * Ping the API to create an issue on Github, if succeed returns the CID (Repository ID on database + Issue ID on Github)
   * @param payload
   * @param networkName 
   * @returns string
   */
  async function createPreBounty(payload: CreateBounty,
                                 networkName = publicRuntimeConfig?.networkConfig?.networkName): Promise<string> {
    return client
        .post("/issue", { ...payload, networkName })
        .then(({ data }) => data)
        .catch((error) => {
          throw error
        });
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
                                    networkName = publicRuntimeConfig?.networkConfig?.networkName) {
    return client
      .patch("/issue", { repoId, githubId, scId, networkName })
      .then(({ data }) => data === "ok")
      .catch(() => false);
  }

  async function getPendingFor(address: string,
                               page = "1",
                               networkName = publicRuntimeConfig?.networkConfig?.networkName) {
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

  async function createPrePullRequest(repoId: string,
                                      githubId: string,
                                      payload: {
      title: string;
      description: string;
      username: string;
      branch: string;
    },
                                      networkName = publicRuntimeConfig?.networkConfig?.networkName) {
    return client
      .post("/pull-request/", { ...payload, repoId, githubId, networkName })
      .then(({ data }) => data)
      .catch((error) => {
        throw error;
      });
  }

  async function cancelPrePullRequest({
    repoId, 
    issueGithubId, 
    bountyId,
    issueCid, 
    pullRequestGithubId,
    customNetworkName,
    creator,
    userBranch,
    userRepo
  }) {
    return client
      .delete("/pull-request/", {
        data: { repoId, 
                issueGithubId, 
                bountyId,
                issueCid, 
                pullRequestGithubId,
                customNetworkName,
                creator,
                userBranch,
                userRepo }
      })
      .then(({ data }) => data)
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
  
  async function getTotalBounties(state: string, 
                                  networkName = publicRuntimeConfig.networkConfig.networkName): Promise<number> {
    const search = new URLSearchParams({ state, networkName }).toString();
    return client.get<number>(`/search/issues/total?${search}`).then(({ data }) => data);
  }

  async function getAllUsers(payload: { page: number } = { page: 1 }) {
    return client
      .post<User[]>("/search/users/all", payload)
      .then(({ data }) => data)
      .catch(() => []);
  }

  async function createRepo(owner, repo, networkName = publicRuntimeConfig?.networkConfig?.networkName) {
    return client
      .post("/repos/", { owner, repo, networkName })
      .then(({ status }) => status === 200)
      .catch((e) => {
        console.error("Failed to create repo", e);
        return false;
      });
  }

  async function getReposList(force = false, networkName = publicRuntimeConfig?.networkConfig?.networkName) {
    const search = new URLSearchParams({ networkName }).toString();

    if (!force && repoList.length)
      return Promise.resolve(repoList as ReposList);

    return client
      .get<ReposList>(`/repos?${search}`)
      .then(({ data }) => data)
      .catch(() => []);
  }

  async function removeRepo(id: string) {
    return client
      .delete(`/repos/${id}`)
      .then(({ status }) => status === 200)
      .catch(() => false);
  }

  async function processEvent(entity: Entities, 
                              event: Events, 
                              networkName: string = publicRuntimeConfig?.networkConfig?.networkName,
                              params: PastEventsParams = {}) {
    return client.post(`/past-events/${entity}/${event}`, {
      ...params,
      networkName
    });
  }

  async function getHealth() {
    return client
      .get("/health")
      .then(({ status }) => status === 204)
      .catch(() => false);
  }

  async function getClientNation() {
    return client
      .get("/ip")
      .then(({ data }) => data || { countryCode: "US", country: "" })
      .catch(() => {
        return { countryCode: "US", country: "" };
      });
  }

  async function userHasPR(issueId: string,
                           login: string,
                           networkName = publicRuntimeConfig?.networkConfig?.networkName) {
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
                                     networkName = publicRuntimeConfig?.networkConfig?.networkName) {
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
                              networkName = publicRuntimeConfig?.networkConfig?.networkName) {
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
                                  networkName = publicRuntimeConfig?.networkConfig?.networkName) {
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
                                   networkName = publicRuntimeConfig?.networkConfig?.networkName) {
    return client
      .put("/pull-request/review", {
        issueId,
        pullRequestId,
        githubLogin,
        body,
        networkName
      })
      .then((response) => response)
      .catch(error => {
        throw error;
      });
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
  
  async function uploadFiles(files: File | File[]): Promise<FileUploadReturn> {
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
        rows: Network[];
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
      .get<Network>(`/network?${search}`)
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
        rows: Network[];
        count: number;
        pages: number;
        currentPage: number;
      }>(`/search/networks/?${params}`)
      .then(({ data }) => data)
      .catch(() => ({ rows: [], count: 0, pages: 0, currentPage: 1 }));
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
    createPrePullRequest,
    createRepo,
    createReviewForPR,
    getAllUsers,
    getClientNation,
    getHealth,
    getIssue,
    getIssues,
    getPayments,
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
    createPreBounty,
    cancelPrePullRequest
  };
}
