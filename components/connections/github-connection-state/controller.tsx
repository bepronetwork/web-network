import GithubConnectionStateView from "components/connections/github-connection-state/view";

import { useAppState } from "contexts/app-state";

import { useAuthentication } from "x-hooks/use-authentication";

interface GithubConnectionStateProps {
  handleClickDisconnect?: () => void;
}

export default function GithubConnectionState({
  handleClickDisconnect,
}: GithubConnectionStateProps) {
  const { state } = useAppState();
  const { signInGithub, signInWallet } = useAuthentication();

  return (
    <GithubConnectionStateView
      connectGithub={signInGithub}
      connectWallet={signInWallet}
      handleClickDisconnect={handleClickDisconnect}
      userLogin={state?.currentUser?.login}
      walletAddress={state.currentUser?.walletAddress}
    />
  );
}
