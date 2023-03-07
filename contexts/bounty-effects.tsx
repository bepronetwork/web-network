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
            [
    state.Service?.active?.network, state.Service?.network?.active?.networkAddress, 
    state.currentBounty?.data?.contractId,
    state.currentUser?.walletAddress 
            ])
  useEffect(bounty.validateKycSteps, [
      state?.currentBounty?.data?.isKyc,
      state?.currentBounty?.data?.kycTierList,
      state?.currentUser?.kycSession,
  ]);

  return <BountyEffectsContext.Provider value={_context} children={children} />
}