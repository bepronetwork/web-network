import { useEffect } from "react";

import ConnectWalletButton from "components/connect-wallet-button";
import ProfileSide from "components/profile/profile-side";

import { useAppState } from "contexts/app-state";
import { changeNeedsToChangeChain } from "contexts/reducers/change-spinners";

export default function ProfileLayout({ children }) {
  const { state, dispatch } = useAppState();

  useEffect(() => {
    if (state.currentUser?.walletAddress && !state.connectedChain?.matchWithNetworkChain)
      dispatch(changeNeedsToChangeChain(true));
  }, [state.currentUser?.walletAddress, state.connectedChain?.matchWithNetworkChain]);

  return(
    <>
      <ConnectWalletButton asModal={true} />
      
      <div className="row mx-0">
        <ProfileSide />

        <div className="col-10 pt-4 px-4 profile-content bg-gray-950">
          {children}
        </div>
      </div>
    </>
  );
}