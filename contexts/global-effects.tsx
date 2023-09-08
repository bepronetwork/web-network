import {createContext, useEffect} from "react";

import { Web3Connection } from "@taikai/dappkit";
import {useSession} from "next-auth/react";
import {useRouter} from "next/router";

import {useAppState} from "contexts/app-state";
import { changeWeb3Connection } from "contexts/reducers/change-service";

import {useAuthentication} from "x-hooks/use-authentication";
import useChain from "x-hooks/use-chain";
import {useDao} from "x-hooks/use-dao";
import {useNetwork} from "x-hooks/use-network";
import {useSettings} from "x-hooks/use-settings";
import {useTransactions} from "x-hooks/use-transactions";

const _context = {};

export const GlobalEffectsContext = createContext(_context);
export const GlobalEffectsProvider = ({children}) => {

  const {query} = useRouter();
  const session = useSession();
  
  const dao = useDao();
  const network = useNetwork();
  const { chain } = useChain();
  const settings = useSettings();
  const auth = useAuthentication();
  const transactions = useTransactions();
  const { state, dispatch } = useAppState();

  const { connectedChain, currentUser, Service, supportedChains } = state;

  useEffect(() => {
    const web3Connection = new Web3Connection({
      skipWindowAssignment: true
    });

    dispatch(changeWeb3Connection(web3Connection));
  }, []);

  useEffect(dao.listenChainChanged, [
    supportedChains
  ]);

  useEffect(() => {
    dao.start();
  }, [
    Service?.network?.active?.chain_id,
    connectedChain?.id,
    connectedChain?.registry,
    currentUser?.connected
  ]);

  useEffect(() => {
    dao.changeNetwork();
  }, [
    Service?.active,
    Service?.network?.active?.networkAddress,
    Service?.network?.active?.chain_id,
  ]);

  useEffect(auth.updateWalletBalance, [currentUser?.walletAddress, Service?.active?.network?.contractAddress]);
  useEffect(auth.updateKycSession, [state?.currentUser?.accessToken,
                                    state?.currentUser?.match,
                                    state?.currentUser?.walletAddress,
                                    state?.Settings?.kyc?.tierList]);
  useEffect(auth.verifyReAuthorizationNeed, [currentUser?.walletAddress]);
  useEffect(() => {
    auth.syncUserDataWithSession();
  }, [session]);
  
  useEffect(() => {
    network.updateActiveNetwork();
  }, [query?.network, query?.chain]);
  useEffect(network.loadNetworkTimes, [Service?.active?.network]);
  useEffect(network.loadNetworkAmounts, [Service?.active?.network?.contractAddress, chain]);
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
