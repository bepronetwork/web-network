import {useEffect, useState} from "react";

import {useTranslation} from "next-i18next";

import {ContextualSpan} from "components/contextual-span";
import RepositoryCheck from "components/custom-network/repository-check";

import { useAppState } from "contexts/app-state";

import useApi from "x-hooks/use-api";

interface infoType {
  visible?: boolean;
  type: "warning" | "info" | "danger" | "primary" | "success";
  text: string
}

export default function RepositoriesList({ withLabel = true, repositories, botUser = undefined, onClick }) {
  const { t } = useTranslation("custom-network");

  const [existingRepos, setExistingRepos] = useState([]);
  const [reposWithIssues, setReposWithIssues] = useState([]);
  const [reposUserNotAdmin, setReposUserNotAdmin] = useState([]);
  const [withoutMergeCommitPerm, setWithoutMergeCommitPerm] = useState([]);
  const [withoutBotCollaborator, setWithoutBotCollaborator] = useState([]);

  const { state } = useAppState();
  const { searchRepositories } = useApi();

  const renderInfos: infoType[] = [
    {
      visible: !!existingRepos.length,
      text: t("steps.repositories.used-by-other-network"),
      type: "danger"
    },
    {
      visible: !!reposWithIssues.length,
      text: t("steps.repositories.has-bounties"),
      type: "info"
    },
    {
      visible: !!reposUserNotAdmin.length,
      text: t("steps.repositories.user-permission-not-admin", { count: reposUserNotAdmin.length }),
      type: "warning"
    },
    {
      visible: !!withoutMergeCommitPerm.length,
      text: t("steps.repositories.no-merge-commit-permission", { 
        count: withoutMergeCommitPerm.length,
        repos: withoutMergeCommitPerm.join(", ")
      }),
      type: "warning"
    },
    {
      visible: !!withoutBotCollaborator.length,
      text: t("steps.repositories.without-bot-collab", { 
        count: withoutBotCollaborator.length,
        repos: withoutBotCollaborator.join(", "),
        bot: botUser
      }),
      type: "primary"
    },
    {
      visible: !!repositories?.length && !repositories?.some(({ checked }) => checked),
      text: t("steps.repositories.no-repositories-selected"),
      type: "danger"
    },
  ];

  const activeNetworkName = state.Service?.network?.active?.name;
  const activeNetworCreator = state.Service?.network?.active?.creatorAddress;
  const currentWallet = state.currentUser?.walletAddress?.toLowerCase();

  function updateReposWithoutMergeCommitPerm() {
    setWithoutMergeCommitPerm(repositories.filter(repository => repository.checked && !repository.mergeCommitAllowed)
      .map((repository) => repository.fullName));
  }

  function updateReposWithoutBotCollaborator() {
    if (!botUser) return;

    const hasBotAsCollaborator = repo => !!repo.collaborators.find(c => c === botUser);

    setWithoutBotCollaborator(repositories.filter(repository => repository.checked && 
      repository.isSaved && !hasBotAsCollaborator(repository))
      .map((repository) => repository.fullName));
  }
  
  function handleClick(repository) {
    if (reposWithIssues.includes(repository.fullName)) return;

    onClick(repository.fullName);

    updateReposWithoutMergeCommitPerm();
    updateReposWithoutBotCollaborator();
  }

  useEffect(() => {
    if (!repositories?.length) return;

    const paths = repositories
      .filter((repository) => !repository.isSaved)
      .map((repository) => repository.fullName)
      .join(",");

    if (paths.length)
      searchRepositories({
        path: paths,
        networkName: ""
      })
        .then(({ rows }) => {
          const isUsedByOtherNetwork = ({ network: { name, creatorAddress }}) => 
            (name !== activeNetworkName) ||
            (name === activeNetworkName && 
              creatorAddress !== activeNetworCreator && 
              creatorAddress.toLowerCase() !== currentWallet);

          setExistingRepos(rows.filter(isUsedByOtherNetwork).map((repo) => repo.githubPath));
        })
        .catch(console.log);

    setReposWithIssues(repositories.filter(repository => repository.hasIssues)
      .map((repository) => repository.fullName));

    setReposUserNotAdmin(repositories
          .filter((repository) =>
              repository?.userPermission && repository.userPermission !== "ADMIN")
          .map((repository) => repository.fullName));

    updateReposWithoutMergeCommitPerm();
    updateReposWithoutBotCollaborator();
  }, [repositories]);

  useEffect(updateReposWithoutBotCollaborator, [botUser]);

  function renderInfo({
    text,
    type
  }: infoType) {
    return (
      <ContextualSpan context={type} key={text}>
        {text}
      </ContextualSpan>
    );
  }

  return (
    <div className="row mx-0 justify-content-start repositories-list mb-2">
      { withLabel && 
        <span className="caption-small text-gray px-0">
          {t("steps.repositories.label")}
        </span>
      }

      {repositories.map((repository, index) => (
        <RepositoryCheck
          key={`${index}-${repository.fullName}`}
          label={repositories.filter(r => 
            r.name === repository.name).length > 1 
            ? repository.fullName 
            : repository.name}
          active={repository.checked}
          userPermission={repository.userPermission}
          hasIssues={reposWithIssues.includes(repository.fullName)}
          mergeCommitAllowed={repository.mergeCommitAllowed}
          onClick={() => handleClick(repository)}
          usedByOtherNetwork={!repository.isSaved && existingRepos.includes(repository.fullName)}
        />
      ))}

      {renderInfos.filter(({ visible }) => visible).map(renderInfo)}
    </div>
  );
}
