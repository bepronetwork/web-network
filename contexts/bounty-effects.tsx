import {createContext, useEffect} from "react";

import {useRouter} from "next/router";

import {useBounty} from "x-hooks/use-bounty";
import useChain from "x-hooks/use-chain";

const _context = {};

export const BountyEffectsContext = createContext(_context);

export const BountyEffectsProvider = ({children}) => {
  const bounty = useBounty();
  const { chain } = useChain();
  const { query } = useRouter();

  useEffect(bounty.getDatabaseBounty, [
    chain,
    query?.id,
    query?.repoId,
  ]);

  return <BountyEffectsContext.Provider value={_context} children={children} />
}