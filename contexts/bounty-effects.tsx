import {createContext, useEffect} from "react";

import {useRouter} from "next/router";

import {useAppState} from "contexts/app-state";

import {useBounty} from "x-hooks/use-bounty";

const _context = {};

export const BountyEffectsContext = createContext(_context);

export const BountyEffectsProvider = ({children}) => {

  const {query} = useRouter();
  const {state} = useAppState();
  const bounty = useBounty();

  useEffect(bounty.getDatabaseBounty, [state.Service?.network?.active, query?.id, query?.repoId]);
  useEffect(bounty.getChainBounty, 
    [state.Service?.active, state.Service?.network, state.currentBounty?.data?.contractId])

  return <BountyEffectsContext.Provider value={_context} children={children} />
}