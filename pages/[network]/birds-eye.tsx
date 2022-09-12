import { useEffect, useState } from "react";

import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import router from "next/router";
import { Octokit } from "octokit";

import ConnectWalletButton from "components/connect-wallet-button";

import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useSettings } from "contexts/settings";

import { User } from "interfaces/api";

import useApi from "x-hooks/use-api";

interface PropsUserList extends Partial<User> {
   created_at: string; 
   login: string; 
   public_repos: number; 
   eth: number 
}

export default function FalconPunchPage() {
  const [userList, setUserList] = useState<
  PropsUserList[]
  >([]);

  const { getAllUsers } = useApi();
  const { settings } = useSettings();
  const { service: DAOService } = useDAO();
  const { wallet, user } = useAuthentication();

  function toDays(date = "") {
    return +new Date(date) / (24 * 60 * 60 * 1000);
  }

  function listAllUsers() {
    async function getGithubInfo(ghlogin: string) {
      if (!user) return;

      const octokit = new Octokit({ auth: user.accessToken });

      return octokit.rest.users
        .getByUsername({ username: ghlogin })
        .then(({ data }) => data)
        .catch(() => ({ created_at: "0", login: ghlogin, public_repos: 0 }));
    }

    async function hasEthBalance(address: string) {
      if (!DAOService) return 0;

      return DAOService.connect()
        .then(connected => {
          if (connected) return DAOService.getBalance("eth", address);

          return 0;
        })
        .then((eth) => +eth)
        .catch((e) => {
          console.error("Error on get eth", e);
          return 0;
        });
    }

    async function getInfo({
      githubLogin,
      address
    }: Partial<User>) {
      const {login, public_repos, created_at}: 
      Partial<{ login: string, 
                public_repos: number, 
                created_at: string }> = await getGithubInfo(githubLogin);
      const eth = await hasEthBalance(address);

      setUserList((prev) => [...prev, { login, public_repos, created_at, eth }]);
    }

    getAllUsers()
      .then((users) => Promise.all(users.map(getInfo)))
      .catch((e) => {
        console.error("Failed to get users", e);
      });
  }

  function renderUserRow({ created_at, login, public_repos, eth }) {
    return (
      <div className="row">
        <div className="col">@{login}</div>
        <div
          className={`col text-${
            toDays(created_at) >= 7 ? "success" : "danger"
          }`}
        >
          &gt; 7 {toDays(created_at) > 7 ? "yes" : "no"}{" "}
        </div>
        <div className={`col text-${public_repos ? "success" : "danger"}`}>
          &gt; 0 repos {public_repos ? "yes" : "no"}{" "}
        </div>
        <div className={`col text-${eth ? "success" : "danger"}`}>
          &gt; 0 eth {eth ? "yes" : "no"}{" "}
        </div>
      </div>
    );
  }

  useEffect(() => {
    if (!wallet?.address) return;

    if (wallet.address !== settings?.defaultNetworkConfig?.adminWallet)
      router.push("/");
  }, [wallet?.address]);

  return (
    <>
      <div className="container mb-5">
        <ConnectWalletButton asModal={true} />
        <br />
        <br />
        <br />
        <br />
        <div className="content-wrapper">
          <div className="row mb-3">
            <div className="col">
              <label className="p-small mb-2">Github Token</label>
              <input
                value={user?.accessToken}
                type="text"
                className="form-control"
                placeholder={"Github token"}
                readOnly
              />
            </div>
          </div>
          <div className="row mb-3">
            <div className="col d-flex justify-content-end">
              {(wallet?.address && (
                <button
                  className="btn btn-md btn-primary"
                  onClick={listAllUsers}
                >
                  list all users
                </button>
              )) ||
                ""}
            </div>
          </div>
        </div>
        <div className="mt-3 content-wrapper">
          {userList.map(renderUserRow)}
        </div>
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "connect-wallet-button"
      ]))
    }
  };
};
