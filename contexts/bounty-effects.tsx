import {createContext, useEffect} from "react";

import {useRouter} from "next/router";

import {useAppState} from "contexts/app-state";

import {useBounty} from "x-hooks/use-bounty";
import useChain from "x-hooks/use-chain";

const _context = {};

export const BountyEffectsContext = createContext(_context);

export const BountyEffectsProvider = ({children}) => {
  const bounty = useBounty();
  const { chain } = useChain();
  const { query } = useRouter();
  const { state: { Service, connectedChain, currentBounty, currentUser } } = useAppState();

  useEffect(bounty.getDatabaseBounty, [
    chain,
    query?.id,
    query?.repoId,
  ]);

  useEffect(bounty.getChainBounty, [
    Service?.active?.network?.contractAddress, 
    Service?.network?.active?.networkAddress, 
    currentBounty?.data?.contractId,
    currentUser?.walletAddress,
    connectedChain?.id,
  ]);

  return <BountyEffectsContext.Provider value={_context} children={children} />
}