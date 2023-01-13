import BigNumber from "bignumber.js";
import {head} from "lodash";

import {useAppState} from "contexts/app-state";

import {
  CancelPrePullRequestParams,
  CreatePrePullRequestParams,
  CreateReviewParams,
  MergeClosedIssueParams,
  PastEventsParams,
  PatchUserParams,
  SearchNetworkParams,
  StartWorkingParams,
  User
} from "interfaces/api";
import {Curator, SearchCuratorParams} from "interfaces/curators";
import {IssueBigNumberData, IssueData, pullRequest} from "interfaces/issue-data";
import {LeaderBoard, SearchLeaderBoard} from "interfaces/leaderboard";
import {Network} from "interfaces/network";
import {PaginatedData} from "interfaces/paginated-data";
import {Proposal} from "interfaces/proposal";
import {ReposList} from "interfaces/repos-list";
import {Token} from "interfaces/token";

import {api, eventsApi} from "services/api";

import {Entities, Events} from "types/dappkit";

import {updateSupportedChains} from "../contexts/reducers/change-supported-chains";
import {toastError, toastSuccess} from "../contexts/reducers/change-toaster";
import {SupportedChainData} from "../interfaces/supported-chain-data";
import {isZeroAddress} from "ethereumjs-util";

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

interface GetNetworkProps {
  name?: string;
  creator?: string;
  isDefault?: boolean;
  address?: string;
}

type FileUploadReturn = {
  hash: string;
  fileName: string;
  size: string;
}[]

const repoList: ReposList = [];

export default function useApi() {
  const  {state, dispatch} = useAppState();
  const DEFAULT_NETWORK_NAME = state?.Service?.network?.active?.name
  
  api.interceptors.request.use(config => {

    if (typeof window === 'undefined')
      return config;

    const currentWallet = sessionStorage.getItem("currentWallet") || ''
    const currentSignature = sessionStorage.getItem("currentSignature") || undefined;
    const currentChainId = sessionStorage.getItem("currentChainId") || 0;

    console.log(`useApi`, currentSignature, currentWallet, currentChainId)

    if (currentWallet)
      config.headers["wallet"] = currentWallet;

    if (currentSignature)
      config.headers["signature"] = currentSignature;

    if (+currentChainId)
      config.headers["chain"] = +currentChainId;

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
    pullRequesterLogin = "",
    pullRequesterAddress = "",
    proposer = "",
    tokenAddress = "",
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
      pullRequesterLogin,
      pullRequesterAddress,
      proposer,
      tokenAddress,
      networkName: networkName.replaceAll(" ", "-")
    });
    return api
      .get<{
        rows: IssueBigNumberData[];
        count: number;
        pages: number;
        currentPage: number;
      }>(`/search/issues/`, {params})
      .then(({ data }) => ({
        ...data,
        rows: data.rows.map(row => ({
          ...row,
          amount: BigNumber(row.amount),
          fundingAmount: BigNumber(row.fundingAmount),
          fundedAmount: BigNumber(row.fundedAmount)
        }))
      }))
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

  async function cancelPrePullRequest({networkName = DEFAULT_NETWORK_NAME, ...rest} : CancelPrePullRequestParams) {
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

  async function createReviewForPR({
    networkName = DEFAULT_NETWORK_NAME,
    event = "COMMENT",
    ...rest
  } : CreateReviewParams) {
    return api
      .put("/pull-request/review", { networkName, event, ...rest })
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

  async function getNetwork({ name, creator, isDefault, address } : GetNetworkProps) {
    const Params = {} as Omit<GetNetworkProps, "isDefault"> & { isDefault: string };
    
    if (name) Params.name = name;
    if (creator) Params.creator = creator;
    if (isDefault) Params.isDefault = isDefault.toString();
    if (address) Params.address = address;

    const search = new URLSearchParams(Params).toString();

    return api
      .get<Network>(`/network?${search}`)
      .then((response) => response)
      .catch((error) => {
        console.log(`failed to get`, error)
        throw error;
      });
  }
  
  async function getTokens() {
    return api
      .get<Token[]>(`/tokens`)
      .then(({ data }) => data)
      .catch((error) => {
        throw error;
      });
  }

  async function getNetworkTokens({
    networkName = DEFAULT_NETWORK_NAME
  }) {
    const params = new URLSearchParams({networkName}).toString();
    return api
      .get<Token[]>(`/search/tokens?${params}`)
      .then(({ data }) => data)
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
    isRegistered = undefined,
    isDefault = undefined
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
      ... (isRegistered !== undefined && { isRegistered: isRegistered.toString() } || {}),
      ... (isDefault !== undefined && { isDefault: isDefault.toString() } || {})
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

  async function searchCurators({
    page = "1",
    address = "",
    isCurrentlyCurator = undefined,
    networkName = DEFAULT_NETWORK_NAME,
    sortBy = "updatedAt",
    order = "DESC"
  }: SearchCuratorParams) {
    const params = new URLSearchParams({
      page,
      address,
      networkName,
      sortBy,
      order,
      ...(isCurrentlyCurator !== undefined && { isCurrentlyCurator: isCurrentlyCurator.toString()} || {})
    }).toString();

    return api
      .get<{
        rows: Curator[];
        count: number;
        pages: number;
        currentPage: number;
      }>(`/search/curators/?${params}`)
      .then(({ data }) => data)
      .catch(() => ({ rows: [], count: 0, pages: 0, currentPage: 1 }));
  }

  async function searchLeaderBoard({
    address = "",
    page = "1",
    sortBy = "numberNfts",
    time = "",
    search = "",
    order = "DESC"
  }: SearchLeaderBoard) {
    const params = new URLSearchParams({
      page,
      address,
      time,
      search,
      sortBy,
      order
    }).toString();

    return api
      .get<{
        rows: LeaderBoard[];
        count: number;
        pages: number;
        currentPage: number;
      }>(`/search/leaderboard/?${params}`)
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
    return api.get("/settings")
      .then((({ data }) => data))
      .catch((error) => { throw error });
  }

  async function createNFT(issueContractId: number,
                           proposalContractId: number,
                           mergerAddress: string,
                           networkName: string = DEFAULT_NETWORK_NAME) {
    return api
      .post("/nft", { issueContractId, proposalContractId, mergerAddress, networkName })
      .then(({ data }) => data)
      .catch((error) => {
        throw error;
      });
  }

  async function updateChainRegistry(chain: SupportedChainData) {

    const model: any = {
      chainId: chain.chainId,
      name: chain.chainName,
      shortName: chain.chainShortName,
      activeRPC: chain.chainRpc,
      networkId: chain.chainId,
      nativeCurrency: {
        decimals: +chain.chainCurrencyDecimals,
        name: chain.chainCurrencyName,
        symbol: chain.chainCurrencySymbol
      },
      blockScanner: chain.blockScanner,
      eventsApi: chain.eventsApi,
      registryAddress: chain.registryAddress
    }

    return api.patch<{registryAddress?: string}>(`chains`, model)
      .then(response =>
        response.status === 200 &&
        !!response.data?.registryAddress &&
        !isZeroAddress(response.data?.registryAddress)
      )
      .catch((e) => {
        console.log(`error patching registry`, e)
        return false;
      })
  }

  async function saveNetworkRegistry(wallet: string, registryAddress: string) {
    return api.post("setup/registry", { wallet, registryAddress })
      .then(({ data }) => data)
      .catch((error) => {
        throw error;
      });
  }

  async function getSupportedChains(force = false, query: Partial<SupportedChainData> = null) {
    if (!force && state?.supportedChains.length)
      return Promise.resolve(state?.supportedChains);

    const params = new URLSearchParams(query as any);

    return api.get<{result: SupportedChainData[], error?: string; }>(`/chains`, {... query ? {params} : {}})
      .then(({data}) => data)
      .then(data => {
        if (!data.error)
          dispatch(updateSupportedChains(data.result));
        else {
          console.error(`failed to fetch supported chains`, data.error);
        }
        return data?.result;
      })
      .catch(e => {
        console.error(`failed to fetch supported chains`, e);
        return [];
      })
  }

  async function addSupportedChain(chain) {
    chain.loading = true;
    return api.post(`chains`, chain)
      .then(({status}) => status === 200)
      .catch(e => {
        console.error(`failed to addSupportedChain`, e);
        return false;
      })
      .finally(() => {
        chain.loading = false;
        getSupportedChains(true);
      })
  }

  async function deleteSupportedChain(chain) {
    chain.loading = true;

    return api.delete(`chains?id=${chain.chainId}`)
      .then(({status}) => {
        dispatch(status === 200 ? toastSuccess('deleted chain') : toastError('failed to delete'));
        return status === 200
      })
      .catch(e => {
        console.error(`failed to addSupportedChain`, e);
        return false;
      })
      .finally(() => {
        chain.loading = false;
        getSupportedChains(true);
      })
  }

  async function patchSupportedChain(chain, patch: Partial<SupportedChainData>) {
    return api.patch(`chains`, {...chain, ...patch})
      .then(({status}) => status === 200)
      .catch(e => {
        console.error(`failed to patchSupportedChain`, e);
        return false;
      })
      .finally(() => {
        chain.loading = false;
        getSupportedChains(true);
      })
  }

  async function updateNetworkChainId(networkAddress: string, chainId: number) {
    return api.put(`/network/${networkAddress}/`, {chainId})
      .then(res => res.status === 200)
      .catch(() => false);
  }

  return {
    getSupportedChains,
    createIssue,
    createNetwork,
    createPrePullRequest,
    createRepo,
    createReviewForPR,
    getAllUsers,
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
    searchCurators,
    searchLeaderBoard,
    startWorking,
    updateNetwork,
    uploadFiles,
    userHasPR,
    createPreBounty,
    cancelPrePullRequest,
    resetUser,
    getSettings,
    getTokens,
    getNetworkTokens,
    createNFT,
    saveNetworkRegistry,
    addSupportedChain,
    deleteSupportedChain,
    updateChainRegistry,
    updateNetworkChainId,
    patchSupportedChain
  };
}
