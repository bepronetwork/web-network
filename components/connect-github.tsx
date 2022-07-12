import { signIn, signOut } from "next-auth/react";
import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import GithubImage from "components/github-image";

import { useAuthentication } from "contexts/authentication";

import useApi from "x-hooks/use-api";
import useNetworkTheme from "x-hooks/use-network";

export default function ConnectGithub() {
  const { t } = useTranslation("common");

  const { push, asPath } = useRouter();

  const { getUserOf } = useApi();
  const { wallet } = useAuthentication();
  const { getURLWithNetwork } = useNetworkTheme();

  async function clickSignIn() {
    localStorage.setItem("lastAddressBeforeConnect", wallet?.address);

    const user = await getUserOf(wallet?.address?.toLowerCase());

    if (!user) return push(getURLWithNetwork("/connect-account"));

    await signOut({ redirect: false });

    signIn("github", {
      callbackUrl: `${window.location.protocol}//${window.location.host}/${asPath}`
    });
    
  }

  return (
    <div className="container-fluid">
      <div className="row mtn-4 mb-2">
        <div className="col text-center px-0">
          <div className="content-wrapper py-3 border-radius-8 bg-dark-gray">
            <GithubImage />{" "}
            <span className="caption-small mx-3">
              {t("actions.connect-github")}
            </span>
            <button
              className="btn btn-primary text-uppercase"
              onClick={() => clickSignIn()}
            >
              {t("actions.connect")}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
