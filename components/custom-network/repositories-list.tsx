import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";

import RepositoryCheck from "components/custom-network/repository-check";

import useApi from "x-hooks/use-api";

export default function RepositoriesList({ withLabel = true, repositories, onClick }) {
  const { t } = useTranslation("custom-network");

  const [existingRepos, setExistingRepos] = useState([]);
  const [reposWithIssues, setReposWithIssues] = useState([]);

  const { searchRepositories } = useApi();

  function handleClick(repository) {
    if (reposWithIssues.includes(repository.fullName)) return;

    onClick(repository.fullName);
  }

  useEffect(() => {
    if (!repositories.length) return;

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
  }, [repositories]);

  return (
    <div className="row mx-0 justify-content-start repositories-list">
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
          hasIssues={reposWithIssues.includes(repository.fullName)}
          onClick={() => handleClick(repository)}
          usedByOtherNetwork={!repository.isSaved && existingRepos.includes(repository.fullName)}
        />
      ))}

      {existingRepos.length ? (
        <span className="p-small text-danger px-0">
          {t("steps.repositories.used-by-other-network")}
        </span>
      ) : (
        ""
      )}

      {reposWithIssues.length ? (
        <span className="p-small text-info px-0">
          {t("steps.repositories.has-bounties")}
        </span>
      ) : (
        ""
      )}
    </div>
  );
}
