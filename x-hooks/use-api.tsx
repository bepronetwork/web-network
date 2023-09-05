import axios from "axios";
import BigNumber from "bignumber.js";
import {isZeroAddress} from "ethereumjs-util";
import {head} from "lodash";

import {useAppState} from "contexts/app-state";

import { issueParser } from "helpers/issue";

import {
  CancelPrePullRequestParams,
  CreatePrePullRequestParams,
  CreateReviewParams,
  SearchActiveNetworkParams,
  PatchUserParams,
  User,
  PastEventsParams,
  SearchNetworkParams
} from "interfaces/api";
import { Curator, SearchCuratorParams } from "interfaces/curators";
import { NetworkEvents, RegistryEvents, StandAloneEvents } from "interfaces/enums/events";
import { HeaderNetworksProps } from "interfaces/header-information";
import { IssueBigNumberData, IssueData, PullRequest } from "interfaces/issue-data";
import { LeaderBoard, SearchLeaderBoard } from "interfaces/leaderboard";
import { Network } from "interfaces/network";
import { PaginatedData } from "interfaces/paginated-data";
import { Proposal } from "interfaces/proposal";
import { Token } from "interfaces/token";

import {api} from "services/api";


import {updateSupportedChains} from "../contexts/reducers/change-supported-chains";
import {toastError, toastSuccess} from "../contexts/reducers/change-toaster";
import {SupportedChainData} from "../interfaces/supported-chain-data";

interface NewIssueParams {
  title: string;
  description: string;
  amount: number;
  creatorAddress: string;
  creatorGithub: string;
  repository_id: string;
}

interface GetNetworkProps {
  name?: string;
  creator?: string;
  isDefault?: boolean;
  address?: string;
  byChainId?: boolean;
  chainName?: string;
}

type FileUploadReturn = {
  hash: string;
  fileName: string;
  size: string;
}[]

export default function useApi() {
  const  {state, dispatch} = useAppState();
  const DEFAULT_NETWORK_NAME = state?.Service?.network?.active?.name

  api.interceptors.request.use(config => {

    if (typeof window === 'undefined')
      return config;

    const currentWallet = sessionStorage.getItem("currentWallet") || ''
    const currentSignature = sessionStorage.getItem("currentSignature") || undefined;
    const currentChainId = sessionStorage.getItem("currentChainId") || 0;

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
    networkName = "",
    allNetworks = undefined,
    visible = true,
    chainId = ""
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
      chainId,
      networkName: networkName.replaceAll(" ", "-"),
      ... (allNetworks !== undefined && { allNetworks: allNetworks.toString() } || {}),
      ... (visible === true && { visible: visible.toString() } || {})
    }).toString();

    return api
      .get<{
        rows: IssueData[];
        count: number;
        pages: number;
        currentPage: number;
      }>(`/search/issues?${params}`)
      .then(({ data }) => ({
        ...data,
        rows: data.rows.map(issue => issueParser(issue))
      }))
      .catch(() => ({ rows: [], count: 0, pages: 0, currentPage: 1 }));
  }

  async function searchRecentIssues({
    repoId = "",
    sortBy = "updatedAt",
    order = "DESC",
    address = "",
    creator = "",
    networkName = "",
    state = "open",
    visible = true
  }) {
    const params = new URLSearchParams({
      address,
      repoId,
      sortBy,
      order,
      creator,
      networkName: networkName.replaceAll(" ", "-"),
      state,
      ... (visible !== undefined && { visible: visible.toString() } || {})
    }).toString();
    return api
      .get<IssueData[]>(`/search/issues/recent/?${params}`)
      .then(({ data }): IssueBigNumberData[] => data.map(issue => issueParser(issue)))
      .catch((): IssueBigNumberData[] => ([]));
  }

  async function getIssue(repoId: string | number,
                          ghId: string | number,
                          networkName = DEFAULT_NETWORK_NAME,
                          chainId?: string | number) {
    return api
      .get<IssueData>(`/issue/${repoId}/${ghId}/${networkName}`, { params: { chainId } })
      .then(({ data }) => issueParser(data))
      .catch(() => null);
  }

  async function getPayments( wallet: string,
                              startDate: string, 
                              endDate: string, 
                              networkName = "", 
                              networkChain = "") {
    const dates = startDate ? { startDate, endDate } : { endDate }
    const params = new URLSearchParams({ wallet, networkName, networkChain, ...dates }).toString();

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

  async function createToken(payload: {address: string; minAmount: string; chainId: number }) {
    return api
      .post("/token", { ...payload })
      .then(({ data }) => data)
      .catch(() => null);
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
      .get<PaginatedData<PullRequest>>(`/pull-request?${search}`)
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

  async function getTotalBounties(networkName = "", state = ""): Promise<number> {
    const search = new URLSearchParams({ state, networkName }).toString();
    return api.get<number>(`/search/issues/total?${search}`).then(({ data }) => data);
  }

  async function getTotalNetworks(name = "",
                                  creatorAddress = "",
                                  isClosed = false,
                                  isRegistered = true): Promise<number> {
    const search = new URLSearchParams({
      creatorAddress,
      name,
      ... (isClosed !== undefined && { isClosed: isClosed.toString() } || {}),
      ... (isRegistered !== undefined && { isRegistered: isRegistered.toString() } || {})
    }).toString();
    return api
      .get<number>(`/search/networks/total?${search}`)
      .then(({ data }) => data);
  }

  async function getAllUsers(payload: { page: number } = { page: 1 }) {
    return api
      .post<User[]>("/search/users/all", payload)
      .then(({ data }) => data)
      .catch(() => []);
  }

  async function processEvent(event: NetworkEvents | RegistryEvents | StandAloneEvents,
                              address?: string,
                              params: PastEventsParams = { fromBlock: 0 },
                              currentNetworkName?: string) {
    const chainId = state.connectedChain?.id;
    const events = state.connectedChain?.events;
    const registryAddress = state.connectedChain?.registry;
    const networkAddress = state.Service?.network?.active?.networkAddress;

    const isRegistryEvent = event in RegistryEvents;
    const addressToSend = address || (isRegistryEvent ? registryAddress : networkAddress);

    if (!events || !addressToSend || !chainId)
      throw new Error("Missing events url, chain id or address");

    const eventsURL = new URL(`/read/${chainId}/${addressToSend}/${event}`, state.connectedChain?.events);
    const networkName = currentNetworkName || state.Service?.network?.active?.name;

    return axios.get(eventsURL.href, {
    params
    })
      .then(({ data }) => {
        if (isRegistryEvent) return data;

        const entries = data.flatMap(i => {
          if (!Object.keys(i).length) return [];

          const keys = Object.keys(i[networkName]);

          if (!Object.keys(i).length) return [];

          return keys.map(key => [key, i[networkName][key]]);
        });

        return Object.fromEntries(entries);
      });
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
      .get<PaginatedData<PullRequest>>(`/pull-request?${search}`)
      .then(({ data: { count } }) => count > 0)
      .catch((e) => {
        console.log("Failed to fetch PR information", e);
        return false;
      });
  }

  async function getUserPullRequests(page = "1", login: string, networkName = DEFAULT_NETWORK_NAME) {
    const search = new URLSearchParams({ page, login, networkName }).toString();

    return api
      .get<PaginatedData<PullRequest>>(`/pull-request?${search}`)
      .then(({ data }) => data)
      .catch((e) => {
        console.log("Failed to fetch PR information", e);
        return false;
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

  async function getProposal(dbId: string | number): Promise<Proposal> {
    return api
      .get<Proposal>(`/merge-proposal/${dbId}`)
      .then(({ data }) => data)
      .catch(() => null);
  }

  async function getUserOf(address: string): Promise<User> {
    return api
      .post<User>("/search/users/address/", [address])
      .then(({ data }) => data[0])
      .catch(() => ({} as User));
  }

  async function getUserAll(address: string, login: string): Promise<User> {
    return api
      .post<User[]>("/search/users/all/", [address,login])
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

  async function getNetwork({ name, creator, isDefault, address, byChainId, chainName } : GetNetworkProps) {
    const Params = {} as Omit<GetNetworkProps, "isDefault" | "byChainId"> & { isDefault: string; byChainId: string; };

    if (name) Params.name = name;
    if (creator) Params.creator = creator;
    if (isDefault) Params.isDefault = isDefault.toString();
    if (byChainId) Params.byChainId = byChainId.toString();
    if (address) Params.address = address;
    if (chainName) Params.chainName = chainName;

    const search = new URLSearchParams(Params).toString();

    return api
      .get<Network>(`/network?${search}`)
      .then((response) => response)
      .catch((error) => {
        console.log(`failed to get`, error)
        throw error;
      });
  }

  async function getHeaderNetworks() {
    return api
      .get<HeaderNetworksProps>(`/header/networks`)
      .then(({ data }) => ({
        ...data,
        TVL: BigNumber(data.TVL)
      }))
      .catch((error) => {
        throw error;
      });
  }
  
  async function getTokens(chainId?: string, networkName?: string) {
    return api
      .get<Token[]>("/search/tokens", { params: {chainId, networkName} })
      .then(({ data }) => data)
      .catch((error) => {
        throw error;
      });
  }

  async function getNetworkTokens({
    networkName = DEFAULT_NETWORK_NAME,
    chainId = ""
  }) {
    return api
      .get<Token[]>("/search/tokens", { params: {networkName, chainId}})
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
    isDefault = undefined,
    isNeedCountsAndTokensLocked = undefined,
    chainId = "",
    chainShortName = ""
  }: SearchNetworkParams) {
    const params = {
      page,
      name,
      creatorAddress,
      networkAddress,
      sortBy,
      order,
      search,
      chainId,
      chainShortName,
      ... (isClosed !== undefined && { isClosed: isClosed.toString() } || {}),
      ... (isRegistered !== undefined && { isRegistered: isRegistered.toString() } || {}),
      ... (isDefault !== undefined && { isDefault: isDefault.toString() } || {}),
      ...((isNeedCountsAndTokensLocked !== undefined && {
        isNeedCountsAndTokensLocked: isNeedCountsAndTokensLocked.toString(),
      }) || {})
    };

    return api
      .get<{
        rows: Network[];
        count: number;
        pages: number;
        currentPage: number;
      }>(`/search/networks`, { params })
      .then(({ data }) => data)
      .catch(() => ({ rows: [], count: 0, pages: 0, currentPage: 1 }));
  }

  async function searchActiveNetworks({
    page = "1",
    creatorAddress = "",
    sortBy = "updatedAt",
    order = "DESC",
    isClosed = undefined,
    isRegistered = undefined,
    name = ""
  }: SearchActiveNetworkParams) {
    const params = new URLSearchParams({
      page,
      creatorAddress,
      sortBy,
      order,
      name,
      ... (isClosed !== undefined && { isClosed: isClosed.toString() } || {}),
      ... (isRegistered !== undefined && { isRegistered: isRegistered.toString() } || {})
    }).toString();

    return api
      .get<{
        rows: Network[];
        count: number;
        pages: number;
        currentPage: number;
      }>(`/search/networks/active/?${params}`)
      .then(({ data }) => ({
        ...data,
        rows: data.rows.map(row => ({
          ...row,
          totalValueLock: BigNumber(row.totalValueLock)
        }))
      }))
      .catch(() => ({ rows: [], count: 0, pages: 0, currentPage: 1 }));
  }

  async function searchCurators({
    page = "1",
    address = "",
    isCurrentlyCurator = undefined,
    networkName = "",
    sortBy = "updatedAt",
    order = "DESC",
    chainShortName = ""
  }: SearchCuratorParams) {
    const params = new URLSearchParams({
      page,
      address,
      networkName,
      sortBy,
      order,
      chainShortName,
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

  async function getCuratorsResume({
    isCurrentlyCurator = undefined,
    networkName = "",
    chainShortName = ""
  }) {
    const params = {
      networkName,
      chainShortName,
      ...(isCurrentlyCurator !== undefined && { isCurrentlyCurator: isCurrentlyCurator.toString()} || {})
    };

    return api
      .get<{
        totalCurators: number;
        totalLocked: string;
        totalDelegated: string;
        totalValue: string;
        totalActiveCurators: number;
      }>("/search/curators/total", { params })
      .then(({ data }) => data)
      .catch(() => ({ 
        totalCurators: 0, 
        totalLocked: "0", 
        totalDelegated: "0", 
        totalValue: "0", 
        totalActiveCurators: 0
      }));
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
        !isZeroAddress(response.data?.registryAddress))
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
    if (!force && state?.supportedChains?.length)
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

  async function getKycSession(asNewSession = false){
    const params = asNewSession ? {asNewSession}: {};

    return api.get("/kyc/init",{
      params
    })
    .then(({ data }) => data)
    .catch((error) => {
      throw error;
    });
  }

  async function validateKycSession(session_id: string){
    return api.get("/kyc/validate", {
      headers:{
        session_id
      }
    })
    .then(({ data }) => data)
    .catch((error) => {
      throw error;
    });
  }

  return {
    getSupportedChains,
    createIssue,
    createToken,
    createPrePullRequest,
    createReviewForPR,
    getAllUsers,
    getHealth,
    getIssue,
    getPayments,
    getNetwork,
    getHeaderNetworks,
    getPendingFor,
    getProposal,
    getPullRequestIssue,
    getTotalUsers,
    getTotalBounties,
    getTotalNetworks,
    getUserAll,
    getUserOf,
    getUserPullRequests,
    getUserWith,
    isNetworkOwner,
    joinAddressToUser,
    processEvent,
    removeUser,
    searchIssues,
    searchRecentIssues,
    searchNetworks,
    searchActiveNetworks,
    searchCurators,
    searchLeaderBoard,
    uploadFiles,
    userHasPR,
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
    patchSupportedChain,
    getKycSession,
    validateKycSession,
    getCuratorsResume
  };
}
