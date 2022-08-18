import { head } from "lodash";

import { getSettingsFromSessionStorage } from "helpers/settings";

import { 
  PastEventsParams, 
  CreatePrePullRequestParams, 
  SearchNetworkParams, 
  User, 
  CancelPrePullRequestParams, 
  StartWorkingParams, 
  PatchUserParams, 
  MergeClosedIssueParams,
  CreateReviewParams
} from "interfaces/api";
import { IssueData, pullRequest } from "interfaces/issue-data";
import { Network } from "interfaces/network";
import { PaginatedData } from "interfaces/paginated-data";
import { Proposal } from "interfaces/proposal";
import { ReposList } from "interfaces/repos-list";

import { api, eventsApi } from "services/api";

import { Entities, Events } from "types/dappkit";
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
  repositoryId: string;
}

type FileUploadReturn = {
  hash: string;
  fileName: string;
  size: string;
}[]

const repoList: ReposList = [];

export default function useApi() {
  const sessionStorageSettings = getSettingsFromSessionStorage();
  const DEFAULT_NETWORK_NAME = sessionStorageSettings?.defaultNetworkConfig?.name || "bepro";

  api.interceptors.request.use(config => {
    config.headers["wallet"] = typeof window !== 'undefined' && sessionStorage.getItem("currentWallet") || ""

    return config;
  });

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
    proposer = "",
    networkName = DEFAULT_NETWORK_NAME
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
      proposer,
      networkName
    }).toString();
    return api
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
    networkName = DEFAULT_NETWORK_NAME
  }) {
    const params = new URLSearchParams({
      page,
      owner,
      name,
      path,
      networkName
    }).toString();
    return api
      .get<{ rows; count: number; pages: number; currentPage: number }>(`/search/repositories?${params}`)
      .then(({ data }) => data)
      .catch(() => ({ rows: [], count: 0, pages: 0, currentPage: 1 }));
  }

  async function getIssue(repoId: string | number, ghId: string | number, networkName = DEFAULT_NETWORK_NAME) {
    return api
      .get<IssueData>(`/issue/${repoId}/${ghId}/${networkName}`)
      .then(({ data }) => data)
      .catch(() => null);
  }

  async function getPayments(wallet: string, networkName = DEFAULT_NETWORK_NAME, startDate: string, endDate: string) {
    const dates = startDate ? { startDate, endDate } : { endDate }
    const params = new URLSearchParams({ wallet, networkName, ...dates }).toString();

    return api
      .get<IssueData[]>(`/payments?${params}`)
      .then(({ data }) => data)
      .catch(() => null);
  }

  async function createIssue(payload: NewIssueParams, networkName = DEFAULT_NETWORK_NAME) {
    return api
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
  async function createPreBounty(payload: CreateBounty, networkName = DEFAULT_NETWORK_NAME): Promise<string> {
    return api
        .post("/issue", { ...payload, networkName })
        .then(({ data }) => data)
        .catch((error) => {
          throw error
        });
  }

  async function getPendingFor(address: string, page = "1", networkName = DEFAULT_NETWORK_NAME) {
    const search = new URLSearchParams({
      address,
      page,
      state: "pending",
      networkName
    }).toString();
    return api
      .get<IssueData[]>(`/search/issues/?${search}`)
      .then(({ data }) => data)
      .catch(() => null);
  }

  async function createPrePullRequest({ 
    networkName = DEFAULT_NETWORK_NAME,
    ...rest 
  } : CreatePrePullRequestParams) {
    return api
      .post("/pull-request/", { networkName, ...rest })
      .then(({ data }) => data)
      .catch((error) => {
        throw error;
      });
  }

  async function cancelPrePullRequest({ 
    networkName = DEFAULT_NETWORK_NAME,
    ...rest 
  } : CancelPrePullRequestParams) {
    return api
      .delete("/pull-request/", { data: { customNetworkName: networkName, ...rest } })
      .then(({ data }) => data)
      .catch((error) => {
        throw error;
      });
  }

  async function getPullRequestIssue(issueId: string, page = "1") {
    const search = new URLSearchParams({ issueId, page }).toString();
    return api
      .get<PaginatedData<pullRequest>>(`/pull-request?${search}`)
      .then(({ data: { rows } }) => head(rows))
      .catch((e) => {
        console.log("Failed to fetch PR information", e);
        return null;
      });
  }

  async function joinAddressToUser({ wallet, ...rest } : PatchUserParams): Promise<boolean> {
    return api.patch(`/user/connect`, { wallet, ...rest });
  }

  async function getUserWith(login: string): Promise<User> {
    return api
      .post<User[]>("/search/users/login/", [login])
      .then(({ data }) => data[0] || ({} as User))
      .catch(() => ({} as User));
  }

  async function getTotalUsers(): Promise<number> {
    return api.get<number>("/search/users/total").then(({ data }) => data);
  }
  
  async function getTotalBounties(state: string, networkName = DEFAULT_NETWORK_NAME): Promise<number> {
    const search = new URLSearchParams({ state, networkName }).toString();
    return api.get<number>(`/search/issues/total?${search}`).then(({ data }) => data);
  }

  async function getAllUsers(payload: { page: number } = { page: 1 }) {
    return api
      .post<User[]>("/search/users/all", payload)
      .then(({ data }) => data)
      .catch(() => []);
  }

  async function createRepo(owner, repo, networkName = DEFAULT_NETWORK_NAME) {
    return api
      .post("/repos/", { owner, repo, networkName })
      .then(({ status }) => status === 200)
      .catch((e) => {
        console.error("Failed to create repo", e);
        return false;
      });
  }

  async function getReposList(force = false, networkName = DEFAULT_NETWORK_NAME) {
    const search = new URLSearchParams({ networkName }).toString();

    if (!force && repoList.length)
      return Promise.resolve(repoList as ReposList);

    return api
      .get<ReposList>(`/repos?${search}`)
      .then(({ data }) => data)
      .catch(() => []);
  }

  async function removeRepo(id: string) {
    return api
      .delete(`/repos/${id}`)
      .then(({ status }) => status === 200)
      .catch(() => false);
  }

  async function processEvent(entity: Entities, 
                              event: Events, 
                              networkName: string = DEFAULT_NETWORK_NAME,
                              params: PastEventsParams = {}) {
    
    return eventsApi.get(`/past-events/${entity}/${event}`, {
      params: { ...params, networkName }
    }).then(({ data }) => data?.[networkName]);
  }

  async function getHealth() {
    return api
      .get("/health")
      .then(({ status }) => status === 204)
      .catch(() => false);
  }

  async function getClientNation() {
    return api
      .get("/ip")
      .then(({ data }) => data || { countryCode: "US", country: "" })
      .catch(() => {
        return { countryCode: "US", country: "" };
      });
  }

  async function userHasPR(issueId: string, login: string, networkName = DEFAULT_NETWORK_NAME) {
    const search = new URLSearchParams({
      issueId,
      login,
      page: "1",
      networkName
    }).toString();
    return api
      .get<PaginatedData<pullRequest>>(`/pull-request?${search}`)
      .then(({ data: { count } }) => count > 0)
      .catch((e) => {
        console.log("Failed to fetch PR information", e);
        return false;
      });
  }

  async function getUserPullRequests(page = "1", login: string, networkName = DEFAULT_NETWORK_NAME) {
    const search = new URLSearchParams({ page, login, networkName }).toString();

    return api
      .get<PaginatedData<pullRequest>>(`/pull-request?${search}`)
      .then(({ data }) => data)
      .catch((e) => {
        console.log("Failed to fetch PR information", e);
        return false;
      });
  }

  async function startWorking({ networkName = DEFAULT_NETWORK_NAME, ...rest } : StartWorkingParams) {
    return api
      .put("/issue/working", { networkName, ...rest })
      .then((response) => response)
      .catch((error) => {
        throw error;
      });
  }

  async function mergeClosedIssue({ networkName = DEFAULT_NETWORK_NAME, ...rest } : MergeClosedIssueParams) {
    return api
      .post("/pull-request/merge", { networkName, ...rest})
      .then((response) => response)
      .catch((error) => {
        throw error;
      });
  }

  async function createReviewForPR({ networkName = DEFAULT_NETWORK_NAME, ...rest } : CreateReviewParams) {
    return api
      .put("/pull-request/review", { networkName, ...rest })
      .then((response) => response)
      .catch(error => {
        throw error;
      });
  }

  async function removeUser(address: string, githubLogin: string) {
    return api
      .delete(`/user/${address}/${githubLogin}`)
      .then(({ status }) => status === 200);
  }

  async function createNetwork(networkInfo) {
    return api
      .post("/network", { ...networkInfo })
      .then((response) => response)
      .catch((error) => {
        throw error;
      });
  }

  async function registerNetwork(networkInfo) {
    return client
      .patch("/network", { ...networkInfo })
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

    return api.post("/files", form).then(({ data }) => data);
  }

  async function updateNetwork(networkInfo) {
    return api
      .put("/network", { ...networkInfo })
      .then((response) => response)
      .catch((error) => {
        throw error;
      });
  }

  async function getProposal(dbId: string | number): Promise<Proposal> {
    return api
      .get<Proposal>(`/merge-proposal/${dbId}`)
      .then(({ data }) => data)
      .catch(() => null);
  }

  async function getUserOf(address: string): Promise<User> {
    return api
      .post<User[]>("/search/users/address/", [address])
      .then(({ data }) => data[0])
      .catch(() => ({} as User));
  }

  async function isNetworkOwner(creatorAddress, networkAddress) {
    const params = new URLSearchParams({
      creatorAddress,
      networkAddress
    }).toString();

    return api
      .get<{
        rows: Network[];
        count: number;
        pages: number;
        currentPage: number;
      }>(`/search/networks/?${params}`)
      .then(({ data }) => !!data.rows.length)
      .catch(() => false);
  }

  async function getNetwork({ name, creator }: { name?: string, creator?: string }) {
    const Params = {} as { name?: string, creator?: string }
    if (name) Params.name = name

    if (creator) Params.creator = creator

    const search = new URLSearchParams(Params).toString();

    return api
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
    search = "",
    isClosed = undefined,
    isRegistered = undefined
  }: SearchNetworkParams) {
    const params = new URLSearchParams({
      page,
      name,
      creatorAddress,
      networkAddress,
      sortBy,
      order,
      search,
      ... (isClosed !== undefined && { isClosed: isClosed.toString() } || {}),
      ... (isRegistered !== undefined && { isRegistered: isRegistered.toString() } || {})
    }).toString();

    return api
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

    return api
      .get<{ rows: IssueData[]; count: number }>(`/search/issues/?${search}`)
      .then(({ data }) => !!data.count)
      .catch(() => false);
  }

  async function resetUser(address: string, githubLogin: string) {
    return api.post("/user/reset", { address, githubLogin });
  }

  async function getSettings() {
    return client.get("/settings")
      .then((({ data }) => data))
      .catch((error) => { throw error });
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
    cancelPrePullRequest,
    resetUser,
    getSettings,
    registerNetwork
  };
}
