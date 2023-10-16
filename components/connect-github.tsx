import { useTranslation } from "next-i18next";

import Button from "components/button";
import GithubImage from "components/github-image";

import { useAppState } from "contexts/app-state";

import { useAuthentication } from "x-hooks/use-authentication";

interface IProps{
  size?: 'md' | 'sm' | 'lg';
}

export default function ConnectGithub({size = 'md'}:IProps) {
  const { t } = useTranslation("common");

  const {state} = useAppState()
  const { signInGithub } = useAuthentication();

  if (['lg', 'sm'].includes(size)) {
    return (
      <Button
        className={size === "lg" && "col-12"}
        onClick={signInGithub}
        disabled={state.spinners?.connectingGH}
        isLoading={state.spinners?.connectingGH}
      >
        <GithubImage opacity={1} />
        <span>{t("actions.connect")}</span>
      </Button>
    );
  }

  return (
    <div className="container-fluid">
      <div className="row mt-3 mb-2 mx-0">
        <div className="col text-center px-0">
          <div className="content-wrapper py-3 border-radius-8 bg-dark-gray">
            <GithubImage />{" "}
            <span className="caption-small mx-3">
              {t("actions.connect-github")}
            </span>
            <span className="d-inline-block">
              <Button
                className="d-inline btn btn-primary text-uppercase"
                disabled={state.spinners?.connectingGH || !state.currentUser?.walletAddress}
                isLoading={state.spinners?.connectingGH}
                onClick={signInGithub}>
                {t("actions.connect")}
              </Button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
