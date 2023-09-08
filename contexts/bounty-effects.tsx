import { ReactNode, createContext, useEffect } from "react";

import { useAppState } from "contexts/app-state";
import { changeCurrentBountyData } from "contexts/reducers/change-current-bounty";

import { issueParser } from "helpers/issue";

import { IssueData } from "interfaces/issue-data";

import { useBounty } from "x-hooks/use-bounty";
interface BountyEffectsProviderProps {
  children: ReactNode;
  currentBounty: IssueData;
}

const _context = {};

export const BountyEffectsContext = createContext(_context);

export const BountyEffectsProvider = ({ children, currentBounty }: BountyEffectsProviderProps) => {  
  const bounty = useBounty();
  const { dispatch, state } = useAppState();

  useEffect(() => {
    const parsedData = issueParser(currentBounty);

    dispatch(changeCurrentBountyData(parsedData));
  }, [
    currentBounty
  ]);

  useEffect(bounty.validateKycSteps, [
      currentBounty?.isKyc,
      currentBounty?.kycTierList,
      state?.currentUser?.kycSession,
  ]);

  return <BountyEffectsContext.Provider value={_context} children={children} />
}