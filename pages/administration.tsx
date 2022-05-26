import React, { useContext, useEffect, useState } from "react";
import { ListGroup, OverlayTrigger, Tooltip } from "react-bootstrap";

import { GetServerSideProps } from "next";
import { useTranslation } from "next-i18next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import getConfig from "next/config";
import Image from "next/image";
import router from "next/router";
import { Octokit } from "octokit";

import Button from "components/button";
import ConnectGithub from "components/connect-github";
import ConnectWalletButton from "components/connect-wallet-button";
import OverrideNameModal from "components/custom-network/override-name-modal";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";
import { toastError } from "contexts/reducers/add-toast";
import { addTransaction } from "contexts/reducers/add-transaction";
import { changeLoadState } from "contexts/reducers/change-load-state";

import { formatDate } from "helpers/formatDate";
import { formatNumberToString } from "helpers/formatNumber";
import { truncateAddress } from "helpers/truncate-address";

import { TransactionTypes } from "interfaces/enums/transaction-types";
import { Network } from "interfaces/network";
import { ReposList } from "interfaces/repos-list";

import useApi from "x-hooks/use-api";

const { publicRuntimeConfig } = getConfig();

export default function ParityPage() {
  const { t } = useTranslation(["common", "parity"]);

  const [issuesList, setIssuesList] = useState([]);
  const [githubToken, setGithubToken] = useState("");
  const [githubLogin, setGithubLogin] = useState("");
  const [networks, setNetworks] = useState<Network[]>([]);
  const [reposList, setReposList] = useState<ReposList>([]);
  const [showModalName, setShowModalName] = useState(false);
  const [availReposList, setAvailableList] = useState<string[]>([]);
  const [networkToUpdate, setNetworkToUpdate] = useState<Network>();

  const { activeNetwork } = useNetwork();
  const { wallet } = useAuthentication();
  const { dispatch } = useContext(ApplicationContext);
  const { service: DAOService } = useDAO();

  const {
    getUserOf,
    createRepo,
    getReposList,
    removeRepo: apiRemoveRepo,
    searchNetworks
  } = useApi();

  const formItem = (label: string, 
    placeholder: string, 
    value: string, 
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void) => ({ label, placeholder, value, onChange });

  const formMaker = [
    formItem(t("parity:fields.github-token.label"),
             t("parity:fields.github-token.placeholder"),
             githubToken,
             (e) => setGithubToken(e?.target?.value)),
    formItem(t("parity:fields.github-login.label"),
             t("parity:fields.github-login.placeholder"),
             githubLogin,
             (e) => setGithubLogin(e?.target?.value))
    // formItem(`Read Repo`, `Github repo name to read from (pex @taikai/dappkit)`, readRepoName, (ev) => setReadRepoName(ev?.target?.value)),
  ];

  function isValidForm() {
    return formMaker.some(({ value }) => !value);
  }

  function listIssues() {
    const octokit = new Octokit({ auth: githubToken });

    function getRepoId(path: string) {
      return reposList.find(({ githubPath }) => {
        return githubPath === path;
      }).id;
    }

    function mapOpenIssue({
      title = "",
      number = 0,
      body = "",
      labels = [],
      tokenAmount,
      repository_url,
      user: { login: creatorGithub }
    }) {
      const getTokenAmount = (lbls) =>
        +lbls
          .find((label = "") => label.search(/k \$?(BEPRO|USDC)/) > -1)
          ?.replace(/k \$?(BEPRO|USDC)/, "000") || 100000;

      if (labels.length && !tokenAmount)
        tokenAmount = getTokenAmount(labels.map(({ name }) => name));
      if (!tokenAmount) tokenAmount = 50000;

      return {
        title,
        number,
        body,
        tokenAmount,
        creatorGithub,
        repository_id: getRepoId(repository_url?.split("/")?.slice(-2)?.join("/"))
      };
    }

    async function getAllIssuesRecursive({ githubPath }, page = 1, pool = []) {
      const [owner, repo] = githubPath.split("/");
      return octokit.rest.issues
        .listForRepo({ owner, repo, state: "open", per_page: 100, page })
        .then(({ data }) =>
          data.length === 100
            ? getAllIssuesRecursive({ githubPath }, page + 1, pool.concat(data))
            : pool.concat(data))
        .catch((e) => {
          console.error("Failed to get issues for", githubPath, page, e);
          return pool;
        });
    }

    dispatch(changeLoadState(true));

    Promise.all(reposList.map((repo) => getAllIssuesRecursive(repo)))
      .then((allIssues) => allIssues.flat().map(mapOpenIssue))
      .then(async (issues) => {
        const openIssues = [];
        for (const issue of issues) {
          console.debug(`(SC) Checking ${issue.title}`);
          if (
            !(
              await DAOService.getBountyByCID(`${issue.repository_id}/${issue.number}`)
            )?.cid
          )
            openIssues.push(issue);
        }

        return openIssues;
      })
      .then(setIssuesList)
      .catch((e) => {
        console.error("Found error", e);
      })
      .finally(() => {
        dispatch(changeLoadState(false));
      });
  }

  function createIssue({
    title,
    body: description = String(t("parity:no-description")),
    tokenAmount,
    number,
    repository_id,
    creatorGithub = githubLogin
  }) {
    const openIssueTx = addTransaction({ type: TransactionTypes.openIssue, amount: +tokenAmount },
                                       activeNetwork);
    dispatch(openIssueTx);

    const msPayload = {
      title,
      description,
      amount: tokenAmount,
      creatorAddress: wallet?.address,
      creatorGithub,
      githubIssueId: number.toString(),
      repository_id
    };

    const scPayload = { tokenAmount: tokenAmount.toString() };

    console.debug("scPayload,", scPayload, "msPayload", msPayload);

    // TODO: use Network_V2 bounty

    return false; /*apiCreateIssue(msPayload, activeNetwork?.name)
      .then((cid) => {
        if (!cid) throw new Error(t("errors.creating-issue"));
        return BeproService.network
          .openIssue([repository_id, cid].join("/"), msPayload.amount)
          .then((txInfo: { events?: {
            OpenIssue?: {
              returnValues?: {
                id: string | number;
              }
            }
          }}) => {
            // BeproService.parseTransaction(txInfo, openIssueTx.payload)
            //             .then(block => dispatch(updateTransaction(block)))
            return {
              githubId: cid,
              issueId:
                txInfo.events?.OpenIssue?.returnValues?.id &&
                [repository_id, cid].join("/")
            };
          });
      })
      .then(({ githubId, issueId }) => {
        if (!issueId) throw new Error(t("parity:errors.creating-issue-on-sc"));

        return patchIssueWithScId(repository_id,
                                  githubId,
                                  issueId,
                                  activeNetwork?.name);
      })
      .then((result) => {
        if (!result)
          // return dispatch(updateTransaction({...openIssueTx.payload as any, remove: true}))
          return true;
      })
      .catch((e) => {
        console.error("Failed to createIssue", e);
        if (e?.message?.search("User denied") > -1)
          dispatch(updateTransaction({ ...(openIssueTx.payload as BlockTransaction), remove: true }));
        else
          dispatch(updateTransaction({
              ...(openIssueTx.payload as BlockTransaction),
              status: TransactionStatus.failed
          }));

        return false;
      });*/
  }

  function createIssuesFromList() {
    return Promise.all(issuesList.map(createIssue))
      .then((okList) => {
        console.debug("All true?", !okList.some((b) => !b));
        console.debug("How many trues vs falses?",
                      okList.reduce((p, c) => (p += (c && 1) || -1), 0));
        console.debug("Length of issuesList,", issuesList.length);
        console.debug("okList", okList);
      })
      .catch((e) => {
        console.error("Some error occurred while trying to open issues,", e);
      });
  }

  function getSelfRepos() {
    getUserOf(wallet?.address)
      .then((user) => {
        setGithubLogin(user?.githubLogin);
        setGithubToken(user?.accessToken);
      })
      .then(() => {
        if (!githubToken) return [];
        const octokit = new Octokit({ auth: githubToken });

        return octokit.rest.orgs
          .listForUser({ username: githubLogin })
          .then(({ data }) => data)
          .then((orgs) => orgs.map((org) => org.login))
          .then((orgs) => {
            function listReposOf(username: string) {
              return octokit.rest.repos
                .listForUser({ username })
                .then(({ data }) => data);
            }
            return Promise.all(orgs.map(listReposOf))
              .then((allOrgs) => allOrgs.flat())
              .then((allOrgsRepos) =>
                allOrgsRepos.filter((repo) => repo.permissions.admin));
          })
          .then((orgRepos) => {
            return octokit.rest.repos
              .listForUser({ username: githubLogin })
              .then(({ data }) => data)
              .then((repos) => repos.concat(orgRepos));
          });
      })
      .then(async (repos) => {
        setReposList(await getReposList(true, activeNetwork?.name));
        setAvailableList(repos
            .filter((repo) => repo.has_issues && !repo.fork)
            .map((repo) => repo.full_name));
      })
      .catch((e) => {
        console.error("Failed to grep user", e);
      });
  }

  async function addNewRepo(owner, repo) {
    const created = await createRepo(owner, repo, activeNetwork?.name);

    if (!created) return dispatch(toastError(t("parity:erros.creating-repo")));

    setReposList(await getReposList(true, activeNetwork?.name));
  }

  async function removeRepo(id: string) {
    return apiRemoveRepo(id).then(async (result) => {
      if (!result) return dispatch(toastError(t("parity:erros.removing-repo")));

      setReposList(await getReposList(true, activeNetwork?.name));
    });
  }

  function getSumOfTokenAmount() {
    return issuesList.reduce((p, c) => (p += +(c.tokenAmount || 50000)), 0);
  }

  function getCostClass() {
    return `text-${
      getSumOfTokenAmount() > wallet?.balance?.bepro ? "danger" : "white"
    }`;
  }

  function renderIssuesList({ title = "", body = "", tokenAmount = 50000, repository_id = null },
                            i: number) {
    return (
      <div className="mt-4" key={i}>
        <div className="content-wrapper">
          <strong className="mb-2">{t("misc.title")}:</strong> {title}
          <span className="fs-small d-block mb-1">
            {(body || t("parity:erros.no-body")).substr(0, 500).concat("...")}
          </span>
          <hr />
          <span className="fs-smallest d-block mbn-2">
            {formatNumberToString(tokenAmount)} BEPRO
          </span>
          <span className="fs-smallest d-block mbn-2">
            {reposList.find((repo) => repo.id === repository_id)?.githubPath}
          </span>
        </div>
      </div>
    );
  }

  function renderFormItems({ label, placeholder, value, onChange }) {
    return (
      <div className="row mb-3">
        <label className="p-small trans mb-2">{label}</label>
        <input
          value={value}
          onChange={onChange}
          type="text"
          className="form-control"
          placeholder={placeholder}
        />
      </div>
    );
  }

  function renderAvailListItem(repoPath: string) {
    const [owner, repo] = repoPath.split("/");
    const isActive = reposList.find(({ githubPath }) => githubPath === repoPath);
    return (
      <ListGroup.Item
        active={!!isActive}
        variant={isActive ? "success" : "shadow"}
        action={true}
        onClick={() =>
          !isActive
            ? addNewRepo(owner, repo)
            : removeRepo(isActive.id.toString())
        }
      >
        {repoPath}
      </ListGroup.Item>
    );
  }

  function handleNetworkClick(networkItem) {
    setNetworkToUpdate(networkItem);
    setShowModalName(true);
  }

  useEffect(() => {
    if (!wallet?.address) return;

    if (wallet?.address !== publicRuntimeConfig?.adminWalletAddress)
      router.push("/account");

    getSelfRepos();

    searchNetworks({})
      .then(({ count, rows }) => {
        if (count > 0) setNetworks(rows);
      })
      .catch((error) => {
        console.log("Failed to retrieve networks list", error);
      });
  }, [wallet?.address]);

  return (
    <>
      <div className="container mb-5 pt-5">
        <ConnectWalletButton asModal={true} />
        <br />
        <br />

        <div className="mt-3 mb-4 content-wrapper">
          <h3 className="text-center">Networks</h3>
          <div className="row caption-medium mb-2 mt-3 text-white">
            <div className="col-2">Name</div>
            <div className="col-3">Description</div>
            <div className="col-2">Address</div>
            <div className="col-1 text-center">Icon</div>
            <div className="col-2 text-center">Logo</div>
            <div className="col-2 text-center">Created At</div>
          </div>

          {networks.map((networkItem) => (
            <div
              key={networkItem.name}
              className="row caption-small mb-1 bg-dark py-3 
              border-radius-8 text-gray cursor-pointer 
              align-items-center bg-ligth-gray-hover"
              onClick={() => handleNetworkClick(networkItem)}
            >
              <div className="col-2">{networkItem.name}</div>
              <div className="col-3">{networkItem.description}</div>
              <div className="col-2">
                <OverlayTrigger
                  key="bottom-creator"
                  placement="bottom"
                  overlay={
                    <Tooltip id={"tooltip-bottom"}>
                      {networkItem.networkAddress}
                    </Tooltip>
                  }
                >
                  <span>{truncateAddress(networkItem.networkAddress)}</span>
                </OverlayTrigger>
              </div>
              <div className="col-1 d-flex align-items-center justify-content-center">
                <Image
                  src={`${publicRuntimeConfig?.ipfsUrl}/${networkItem.logoIcon}`}
                  width={30}
                  height={30}
                />
              </div>
              <div className="col-2 d-flex align-items-center justify-content-center">
                <Image
                  src={`${publicRuntimeConfig?.ipfsUrl}/${networkItem.fullLogo}`}
                  width={150}
                  height={30}
                />
              </div>
              <div className="col-2 text-center">
                {formatDate(networkItem.createdAt, "-")}
              </div>
            </div>
          ))}
        </div>

        <div className="div mt-3 mb-4 content-wrapper">
          {formMaker.map(renderFormItems)}
        </div>
        <div className="content-wrapper mt-3">
          <div className="row">
            <div className="col text-center">
              {(githubToken && (
                <span className="d-block mb-2">
                  {t("parity:select-a-repository")}
                </span>
              )) || <ConnectGithub />}
            </div>
          </div>
          <div className="row">
            <div className="col">
              <ListGroup>{availReposList.map(renderAvailListItem)}</ListGroup>
            </div>
          </div>
          <div className="row mt-3">
            <div className="col d-flex justify-content-end">
              {(issuesList.length && (
                <span className="fs-small me-2">
                  {t("parity:will-cost")}{" "}
                  <span className={getCostClass()}>
                    {formatNumberToString(getSumOfTokenAmount())} {t("bepro")}{" "}
                  </span>{" "}
                  / {formatNumberToString(wallet?.balance?.bepro)} {t("bepro")}
                </span>
              )) ||
                ""}
              {(issuesList.length && (
                <Button
                  className="mr-2"
                  outline
                  onClick={() => createIssuesFromList()}
                >
                  {t("parity:create-bounties")}
                </Button>
              )) ||
                ""}
              {(githubToken && reposList.length && (
                <Button
                  className="mr-2"
                  disabled={isValidForm()}
                  onClick={() => listIssues()}
                >
                  {t("parity:list-bounties")}
                </Button>
              )) ||
                ""}
              {(githubToken && !availReposList.length && (
                <Button onClick={getSelfRepos}>{t("parity:load-repos")}</Button>
              )) ||
                ""}
            </div>
          </div>
        </div>
        {issuesList.map(renderIssuesList)}

        {networkToUpdate && (
          <OverrideNameModal
            show={showModalName}
            network={networkToUpdate}
            onCloseClick={() => {
              setShowModalName(false);
            }}
          />
        )}
      </div>
    </>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {
  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "connect-wallet-button",
        "parity",
        "custom-network"
      ]))
    }
  };
};
