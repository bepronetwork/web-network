import {useTranslation} from "next-i18next";

import {useAppState} from "../contexts/app-state";
import {useAuthentication} from "../x-hooks/use-authentication";
import Button from "./button";
import {ConnectionButton} from "./profile/connect-button";


interface GithubConnectionStateProps {
  handleClickDisconnect?: () => void;
}

export default function GithubConnectionState({handleClickDisconnect}: GithubConnectionStateProps) {
  const {state} = useAppState();
  const { t } = useTranslation("profile");
  const { connectWallet, connectGithub, } = useAuthentication();

  return <>
    <div className="row">
      <div className="col-4">
        <ConnectionButton
          type="github"
          credential={state.currentUser?.login}
          connect={connectGithub}
        />

        { handleClickDisconnect && state?.currentUser?.login && state.currentUser?.walletAddress &&
          <Button outline color="danger" className="mt-3" onClick={handleClickDisconnect}>
            {t("actions.remove-github-account")}
          </Button>
        }
      </div>

      <div className="col-4">
        <ConnectionButton
          type="wallet"
          credential={state.currentUser?.walletAddress}
          connect={connectWallet}
        />
      </div>
    </div>
  </>
}