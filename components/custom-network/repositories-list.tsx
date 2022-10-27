import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import { ContextualSpan } from "components/contextual-span";
import RepositoryCheck from "components/custom-network/repository-check";

import useApi from "x-hooks/use-api";

interface infoType {
  length?: number;
  type: "warning" | "info" | "danger";
  text: string
}

export default function RepositoriesList({ withLabel = true, repositories, onClick }) {
  const { t } = useTranslation("custom-network");

  const [existingRepos, setExistingRepos] = useState([]);
  const [reposWithIssues, setReposWithIssues] = useState([]);
  const [reposUserNotAdmin, setReposUserNotAdmin] = useState([]);
  const [withoutMergeCommitPerm, setWithoutMergeCommitPerm] = useState([]);

  const { searchRepositories } = useApi();

  const renderInfos: infoType[] = [
    {
      length: existingRepos.length,
      text: t("steps.repositories.used-by-other-network"),
      type: "danger"
    },
    {
      length: reposWithIssues.length,
      text: t("steps.repositories.has-bounties"),
      type: "info"
    },
    {
      length: reposUserNotAdmin.length,
      text: t("steps.repositories.user-permission-not-admin"),
      type: "warning"
    },
    {
      length: withoutMergeCommitPerm.length,
      text: t("steps.repositories.no-merge-commit-permission"),
      type: "primary"
    }
  ]


  function updateReposWithoutMergeCommitPerm() {
    setWithoutMergeCommitPerm(repositories.filter(repository => repository.checked && !repository.mergeCommitAllowed)
      .map((repository) => repository.fullName));
  }
  
  function handleClick(repository) {
    if (reposWithIssues.includes(repository.fullName)) return;

    onClick(repository.fullName);

    updateReposWithoutMergeCommitPerm()
  }

  useEffect(() => {
    if (!repositories?.length) return ;

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
          setExistingRepos(rows.map((repo) => repo.githubPath));
        })
        .catch(console.log);

    setReposWithIssues(repositories.filter(repository => repository.hasIssues)
      .map((repository) => repository.fullName));

    setReposUserNotAdmin(repositories
          .filter((repository) =>
              repository?.userPermission && repository.userPermission !== "ADMIN")
          .map((repository) => repository.fullName));

    updateReposWithoutMergeCommitPerm();
  }, [repositories]);

  function renderInfo({
    text,
    type
  }: infoType) {
    return (
        <div className="d-flex ps-0">
          <ContextualSpan context={type}>
            {t("steps.repositories.used-by-other-network")}
          </ContextualSpan>

          <RepositoryCheck
            key={type}
            label="example"
            active={false}
            userPermission={type === "warning" ? "READ" : null}
            hasIssues={type === "info" ? true : false}
            usedByOtherNetwork={type === "danger" ? true : false}
          />
       </div>
    );
  }

  return (
    <div className="row mx-0 justify-content-start repositories-list mb-2">
      { withLabel && 
        <span className="caption-small text-gray px-0">
          {t("steps.repositories.label")}
        </span>
      }

      {repositories.map((repository) => (
        <RepositoryCheck
          key={repository.name}
          label={repository.name}
          active={repository.checked}
          userPermission={repository.userPermission}
          hasIssues={reposWithIssues.includes(repository.fullName)}
          onClick={() => handleClick(repository)}
          usedByOtherNetwork={!repository.isSaved && existingRepos.includes(repository.fullName)}
        />
      ))}

        {renderInfos.map(item => (
          item.length ? renderInfo({
            text: item.text,
            type: item.type,
          })
         : "" 
        ))}
    </div>
  );
}
