import { useTranslation } from "next-i18next";

import GithubImage from "components/github-image";

import { useAuthentication } from "contexts/authentication";


import Button from "./button";

interface IProps{
  size?: 'md' | 'sm';
}

export default function ConnectGithub({size = 'md'}:IProps) {
  const { t } = useTranslation("common");

  const { wallet, connectGithub, isConnecting } = useAuthentication();


  if(size === 'sm'){
    return (
    <Button onClick={connectGithub} disabled={isConnecting || !wallet?.address} isLoading={isConnecting}> 
      <GithubImage  /> 
      <span>{t("actions.connect")}</span>
    </Button>)
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
                disabled={isConnecting || !wallet?.address}
                onClick={connectGithub}
              >
                {t("actions.connect")}
              </Button>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
