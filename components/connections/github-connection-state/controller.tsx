import GithubConnectionStateView from "components/connections/github-connection-state/view";

import { useAppState } from "contexts/app-state";

import { useAuthentication } from "x-hooks/use-authentication";

interface GithubConnectionStateProps {
  onHandleClickDisconnect?: () => void;
}

export default function GithubConnectionState({
  onHandleClickDisconnect,
}: GithubConnectionStateProps) {
  const { state } = useAppState();
  const {  signInWallet } = useAuthentication();

  return (
    <GithubConnectionStateView
      connectWallet={signInWallet}
      onHandleClickDisconnect={onHandleClickDisconnect}
      userLogin={state?.currentUser?.login}
      walletAddress={state.currentUser?.walletAddress}
    />
  );
}
