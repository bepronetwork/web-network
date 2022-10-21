import GithubImage from "components/github-image";
import { useTranslation } from "next-i18next";
import { useAuthentication } from "x-hooks/use-authentication";

interface IProps{
  size?: 'md' | 'sm';
}

export default function ConnectGithub({size = 'md'}:IProps) {
  const { t } = useTranslation("common");
  const { connectGithub } = useAuthentication();


  return (
    <div className="container-fluid">
      <div className="row mt-3 mb-2 mx-0">
        <div className="col text-center px-0">
          <div className="content-wrapper py-3 border-radius-8 bg-dark-gray">
            <GithubImage />{" "}
            <span className="caption-small mx-3">
              {t("actions.connect-github")}
            </span>
            <button
              className="btn btn-primary text-uppercase"
              onClick={() => connectGithub()}
            >
              {t("actions.connect")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
