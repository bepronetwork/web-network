import { ReactNode, createContext, useEffect } from "react";

import { useAppState } from "contexts/app-state";
import { changeCurrentBountyData } from "contexts/reducers/change-current-bounty";

import { issueParser } from "helpers/issue";

import { CurrentBounty } from "interfaces/application-state";
import { IssueData } from "interfaces/issue-data";

import { useBounty } from "x-hooks/use-bounty";

interface ContextCurrentBounty extends Omit<CurrentBounty, "data" | "lastUpdated"> {
  data: IssueData;
}
interface BountyEffectsProviderProps {
  children: ReactNode;
  currentBounty: ContextCurrentBounty;
}

const _context = {};

export const BountyEffectsContext = createContext(_context);

export const BountyEffectsProvider = ({ children, currentBounty }: BountyEffectsProviderProps) => {  
  const bounty = useBounty();
  const { dispatch, state } = useAppState();

  useEffect(() => {
    const parsedData = issueParser(currentBounty.data);

    dispatch(changeCurrentBountyData(parsedData));
  }, [
    currentBounty
  ]);

  useEffect(bounty.validateKycSteps, [
      currentBounty?.data?.isKyc,
      currentBounty?.data?.kycTierList,
      state?.currentUser?.kycSession,
  ]);

  return <BountyEffectsContext.Provider value={_context} children={children} />
}