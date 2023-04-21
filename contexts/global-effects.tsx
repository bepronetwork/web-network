import {createContext, useEffect} from "react";

import {useSession} from "next-auth/react";
import {useRouter} from "next/router";

import {useAppState} from "contexts/app-state";

import {useAuthentication} from "x-hooks/use-authentication";
import useChain from "x-hooks/use-chain";
import {useDao} from "x-hooks/use-dao";
import {useNetwork} from "x-hooks/use-network";
import {useRepos} from "x-hooks/use-repos";
import {useSettings} from "x-hooks/use-settings";
import {useTransactions} from "x-hooks/use-transactions";

const _context = {};

export const GlobalEffectsContext = createContext(_context);
export const GlobalEffectsProvider = ({children}) => {

  const {state} = useAppState();
  const {query} = useRouter();
  const session = useSession();

  const dao = useDao();
  const repos = useRepos();
  const { chain } = useChain();
  const network = useNetwork();
  const settings = useSettings();
  const auth = useAuthentication();
  const transactions = useTransactions();

  const { connectedChain, currentUser, Service } = state;

  // function updateLoadingState() {
  //   dispatch(changeLoadState(Object.values(state.spinners).some(v => v)));
  // }

  useEffect(dao.start, [
    Service?.network?.active?.chain_id,
    connectedChain?.id,
    currentUser?.walletAddress,
  ]);

  useEffect(dao.changeNetwork, [
    Service?.active,
    Service?.network?.active?.networkAddress,
    chain
  ]);

  useEffect(repos.loadRepos, [
    query?.network,
    chain,
    state.Service?.network?.active
  ]);
  useEffect(repos.updateActiveRepo, [query?.repoId, Service?.network?.repos]);

  useEffect(auth.validateGhAndWallet, [session?.data, currentUser?.walletAddress]);
  useEffect(auth.updateWalletAddress, [currentUser]);
  useEffect(auth.listenToAccountsChanged, [Service]);
  useEffect(auth.updateWalletBalance, [currentUser?.walletAddress, Service?.active?.network]);
  useEffect(auth.updateKycSession, [state?.currentUser?.login,
                                    state?.currentUser?.accessToken,
                                    state?.currentUser?.match,
                                    state?.currentUser?.walletAddress,
                                    state?.Settings?.kyc?.tierList]);
  useEffect(auth.updateCurrentUserLogin, [session?.data?.user]);
  useEffect(auth.verifyReAuthorizationNeed, [currentUser?.walletAddress]);
  
  useEffect(() => {
    network.updateActiveNetwork();
  }, [query?.network, query?.chain]);
  useEffect(network.loadNetworkTimes, [Service?.active?.network]);
  useEffect(network.loadNetworkAmounts, [Service?.active?.network?.contractAddress, chain]);
  useEffect(network.loadNetworkAllowedTokens, [Service?.network?.active, chain]);
  useEffect(network.updateNetworkAndChainMatch, [
    connectedChain?.id,
    query?.network,
    query?.chain,
    Service?.network?.active?.chain_id
  ]);

  useEffect(settings.loadSettings, []);

  useEffect(transactions.loadFromStorage, [currentUser?.walletAddress, connectedChain]);

  return <GlobalEffectsContext.Provider value={_context} children={children} />
}