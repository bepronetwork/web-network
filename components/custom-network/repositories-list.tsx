import { useEffect, useState } from 'react'

import GithubInfo from '@components/github-info'
import useApi from '@x-hooks/use-api'

export default function RepositoriesList({ repositories, onClick }) {
  const [existingRepos, setExistingRepos] = useState([])
  const [reposWithIssues, setReposWithIssues] = useState([])

  const { searchRepositories, repositoryHasIssues } = useApi()

  function handleClick(repository) {
    if (reposWithIssues.includes(repository.fullName)) return

    onClick(repository.name)
  }

  useEffect(() => {
    if (!repositories.length) return

    const paths = repositories
      .filter((repository) => !repository.isSaved)
      .map((repository) => repository.fullName)
      .join(',')

    if (paths.length)
      searchRepositories({
        path: paths
      })
        .then(({ rows }) => {
          setExistingRepos(rows.map((repo) => repo.githubPath))
        })
        .catch(console.log)

    const savedPaths = repositories
      .filter((repository) => repository.isSaved)
      .map((repository) => repository.fullName)

    Promise.allSettled(savedPaths.map(path => repositoryHasIssues(path))).then(result => {
      const tmpRepos = []

      result.forEach((item, index) => {
        if ((item as any).value) tmpRepos.push(savedPaths[index])
      })

      setReposWithIssues(tmpRepos)
    })
  }, [repositories])

  return (
    <div className="row mx-0 mb-4 justify-content-start repositories-list">
      <span className="caption-small text-gray px-0">Repositories</span>

      {repositories.map((repository) => (
        <GithubInfo
          parent="list"
          variant="repository"
          key={repository.name}
          label={repository.name}
          active={repository.checked}
          color={reposWithIssues.includes(repository.fullName) ? 'info' : undefined}
          onClick={() => handleClick(repository)}
          disabled={
            !repository.isSaved && existingRepos.includes(repository.fullName)
          }
        />
      ))}

      {existingRepos.length ? (
        <span className="p-small text-danger px-0">
          The highlighted repositories are already being used by another
          network.
        </span>
      ) : (
        ''
      )}

      {reposWithIssues.length ? (
        <span className="p-small text-info px-0">
          The highlighted repositories already have bounties and can't be removed.
        </span>
      ) : (
        ''
      )}
    </div>
  )
}
