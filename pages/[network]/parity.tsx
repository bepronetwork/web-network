import { useContext, useEffect, useState } from "react";
import { ListGroup, OverlayTrigger, Tooltip } from "react-bootstrap";

import { NetworkFactory, toSmartContractDecimals } from "@taikai/dappkit";
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
import { useNetwork } from "contexts/network";
import { toastError, toastInfo } from "contexts/reducers/add-toast";
import { addTransaction } from "contexts/reducers/add-transaction";
import { changeLoadState } from "contexts/reducers/change-load-state";
import { updateTransaction } from "contexts/reducers/update-transaction";

import { formatDate } from "helpers/formatDate";
import { formatNumberToString } from "helpers/formatNumber";
import { truncateAddress } from "helpers/truncate-address";

import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";
import { INetwork } from "interfaces/network";
import { ReposList } from "interfaces/repos-list";

import { BeproService } from "services/bepro-service";

import useApi from "x-hooks/use-api";

const { publicRuntimeConfig } = getConfig()

export default function ParityPage() {
  const { t } = useTranslation(["common", "parity"]);

  const [issuesList, setIssuesList] = useState([]);
  const [githubToken, setGithubToken] = useState("");
  const [githubLogin, setGithubLogin] = useState("");
  const [readRepoName, setReadRepoName] = useState("");
  const [githubCreator, setGithubCreator] = useState("");
  const [councilAmount, setCouncilAmount] = useState("");
  const [outputRepoName, setOutputRepoName] = useState("");
  const [networks, setNetworks] = useState<INetwork[]>([]);
  const [reposList, setReposList] = useState<ReposList>([]);
  const [showModalName, setShowModalName] = useState(false);
  const [settlerTokenName, setSettlerTokenName] = useState("");
  const [deployedContract, setDeployedContract] = useState("");
  const [settlerTokenSymbol, setSettlerTokenSymbol] = useState("");
  const [availReposList, setAvailableList] = useState<string[]>([]);
  const [settlerTokenAddress, setSettlerTokenAddress] = useState("");
  const [networkToUpdate, setNetworkToUpdate] = useState<INetwork>();

  const { activeNetwork } = useNetwork();
  const { wallet, user } = useAuthentication();
  const { dispatch } = useContext(ApplicationContext);

  const {
    getUserOf,
    createIssue: apiCreateIssue,
    patchIssueWithScId,
    createRepo,
    getReposList,
    removeRepo: apiRemoveRepo,
    searchNetworks
  } = useApi();

  const formItem = (label = "",
    placeholder = "",
    value = "",
    onChange = (ev) => {}) => ({ label, placeholder, value, onChange });

  const formMaker = [
    formItem(t("parity:fields.github-token.label"),
             t("parity:fields.github-token.placeholder"),
             githubToken,
             (ev) => setGithubToken(ev?.target?.value)),
    formItem(t("parity:fields.github-login.label"),
             t("parity:fields.github-login.placeholder"),
             githubLogin,
             (ev) => setGithubLogin(ev?.target?.value))
    // formItem(`Read Repo`, `Github repo name to read from (pex @taikai/dappkit)`, readRepoName, (ev) => setReadRepoName(ev?.target?.value)),
  ];

  function isValidForm() {
    return formMaker.some(({ value }) => !value);
  }

  async function createComments(issue_number, out_issue_number) {
    const octokit = new Octokit({ auth: githubToken });
    const readRepoInfo = { owner: githubLogin, repo: readRepoName };
    const outRepoInfo = { owner: githubLogin, repo: outputRepoName };

    async function getComments(page = 1, comments = []) {
      const mapComment = ({
        user: { login = "" },
        created_at = "",
        updated_at = "",
        body = ""
      }) => ({ login, createdAt: created_at, updatedAt: updated_at, body });

      return octokit.rest.issues
        .listComments({ ...readRepoInfo, issue_number, page })
        .then(({ data }) => {
          if (data.length === 100)
            return getComments(page + 1, [
              ...comments,
              ...data.map(mapComment)
            ]);
          return [...comments, ...data.map(mapComment)];
        });
    }

    function createComment({
      login = "",
      body = "",
      createdAt = "",
      updatedAt = "",
      issue_number
    }) {
      body = `> Created by ${login} at ${new Date(createdAt).toISOString()} ${
        updatedAt ? `and updated at ${new Date(updatedAt).toISOString()}` : ""
      }\n\n`.concat(body);
      return octokit.rest.issues.createComment({
        ...outRepoInfo,
        issue_number: out_issue_number,
        body
      });
    }

    const comments = await getComments();

    for (const comment of comments) await createComment(comment);
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
              await BeproService.network.getIssueByCID(`${issue.repository_id}/${issue.number}`)
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

    return apiCreateIssue(msPayload, activeNetwork?.name)
      .then((cid) => {
        if (!cid) throw new Error(t("errors.creating-issue"));
        return BeproService.network
          .openIssue([repository_id, cid].join("/"), msPayload.amount)
          .then((txInfo) => {
            // BeproService.parseTransaction(txInfo, openIssueTx.payload)
            //             .then(block => dispatch(updateTransaction(block)))
            return {
              githubId: cid,
              issueId:
                (txInfo as any).events?.OpenIssue?.returnValues?.id &&
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
          dispatch(updateTransaction({ ...(openIssueTx.payload as any), remove: true }));
        else
          dispatch(updateTransaction({
              ...(openIssueTx.payload as any),
              status: TransactionStatus.failed
          }));

        return false;
      });
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

  function deployNewContract() {
    BeproService.network
      .deployJsonAbi(publicRuntimeConfig.contract.settler, publicRuntimeConfig.contract.transaction, wallet?.address)
      .then((info) => {
        console.debug("Deployed!");
        console.table(info);
        dispatch(toastInfo(t("parity:deployed")));
        setDeployedContract(info.contractAddress);
        return true;
      });
  }

  async function deployNetworkFactory() {
    const factory = new NetworkFactory(BeproService.bepro);

    await factory.loadAbi();

    const receipt = await factory.deployJsonAbi(publicRuntimeConfig.contract.settler);

    console.log({ receipt });
    console.log(receipt.contractAddress);
  }

  function updateCouncilAmount() {
    BeproService.network
      .changeCouncilAmount(councilAmount)
      .then((info) => {
        dispatch(toastInfo(t("parity:council-amount-changed")));
        console.debug("Council Changed!");
        console.table(info);
      })
      .catch((e) => {
        console.error("Error deploying", e);
      });
  }

  function deploySettlerToken() {
    BeproService.erc20
      .deployJsonAbi(settlerTokenName,
                     settlerTokenSymbol,
                     +toSmartContractDecimals(10, 18),
                     wallet?.address)
      .then((txInfo) => {
        console.debug(txInfo);
        dispatch(toastInfo("Deployed!"));
        setSettlerTokenAddress(txInfo.contractAddress);
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

  function changeRedeem() {
    BeproService.network.contract.methods
      .changeRedeemTime(60)
      .send({ from: wallet?.address })
      .then(console.log);
  }

  function changeDisputableTime() {
    BeproService.network.contract.methods
      .changeDisputableTime(60)
      .send({ from: wallet?.address })
      .then(console.log);
  }

  function handleNetworkClick(networkItem) {
    setNetworkToUpdate(networkItem);
    setShowModalName(true);
  }

  useEffect(() => {
    if (!wallet?.address) return;

    if (wallet?.address !== publicRuntimeConfig.adminWalletAddress)
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
        <div className="content-wrapper">
          <div className="row mb-3">
            <label className="p-small trans mb-2">
              {t("parity:fields.contract-address.label")}
            </label>
            <input
              value={deployedContract}
              readOnly={true}
              type="text"
              className="form-control"
              placeholder={t("parity:fields.contract-address.placeholder")}
            />
          </div>
          <div className="row mb-3">
            <label className="p-small trans mb-2">
              {t("parity:fields.council-amount.label")}
            </label>
            <input
              className="form-control"
              value={councilAmount}
              onChange={(e) => setCouncilAmount(e?.target?.value)}
              type="text"
              placeholder={t("parity:fields.council-amount.placeholder")}
            />
          </div>
          <hr />
          <div className="row mb-3 mxn-4">
            <div className="col">
              <label className="p-small trans mb-2 ml-2">
                {t("parity:fields.settler-token-name.label")}
              </label>
              <input
                className="form-control"
                placeholder={t("parity:fields.settler-token-name.placeholder")}
                value={settlerTokenName}
                onChange={(e) => setSettlerTokenName(e?.target.value)}
              />
            </div>
            <div className="col">
              <label className="p-small trans mb-2 ml-2">
                {t("parity:fields.settler-token-symbol.label")}
              </label>
              <input
                className="form-control"
                placeholder={t("parity:fields.settler-token-symbol.placeholder")}
                value={settlerTokenSymbol}
                onChange={(e) => setSettlerTokenSymbol(e?.target.value)}
              />
            </div>
          </div>
          <div className="row mb-3">
            <label className="p-small trans mb-2">
              {t("parity:fields.settler-token-address.label")}
            </label>
            <input
              className="form-control"
              value={settlerTokenAddress}
              readOnly={true}
            />
          </div>

          <div className="row">
            <div className="d-flex flex-row px-0 justify-content-center align-items-center mb-3">
              <Button className="me-2" onClick={() => deployNewContract()}>
                {t("parity:deploy-contract")}
              </Button>
              <Button
                className="me-2"
                disabled={!councilAmount}
                onClick={() => updateCouncilAmount()}
              >
                {t("parity:update-council-amount")}
              </Button>
              <Button
                disabled={!settlerTokenName || !settlerTokenSymbol}
                onClick={() => deploySettlerToken()}
              >
                {t("parity:deploy-settler-token")}
              </Button>
              <Button onClick={() => changeRedeem()}>
                {t("parity:change-redeem-time")}
              </Button>
              <Button onClick={() => changeDisputableTime()}>
                {t("parity:change-disputable-time")}
              </Button>
            </div>

            <div className="d-flex flex-row px-0 justify-content-center align-items-center">
              <Button className="me-2" onClick={() => deployNetworkFactory()}>
                Deploy Network Factory
              </Button>
            </div>
          </div>
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
              className="row caption-small mb-1 bg-dark py-3 border-radius-8 text-gray cursor-pointer align-items-center bg-ligth-gray-hover"
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
                  src={`${publicRuntimeConfig.ipfsUrl}/${networkItem.logoIcon}`}
                  width={30}
                  height={30}
                />
              </div>
              <div className="col-2 d-flex align-items-center justify-content-center">
                <Image
                  src={`${publicRuntimeConfig.ipfsUrl}/${networkItem.fullLogo}`}
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
