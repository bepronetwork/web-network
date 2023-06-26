import { useAppState } from "../../../contexts/app-state";
import { useAuthentication } from "../../../x-hooks/use-authentication";
import GithubConnectionStateView from "./view";

interface GithubConnectionStateProps {
  handleClickDisconnect?: () => void;
}

export default function GithubConnectionState({
  handleClickDisconnect,
}: GithubConnectionStateProps) {
  const { state } = useAppState();
  const { connectWallet, connectGithub } = useAuthentication();

  return (
    <GithubConnectionStateView
      connectGithub={connectGithub}
      connectWallet={connectWallet}
      handleClickDisconnect={handleClickDisconnect}
      userLogin={state?.currentUser?.login}
      walletAddress={state.currentUser?.walletAddress}
    />
  );
}
