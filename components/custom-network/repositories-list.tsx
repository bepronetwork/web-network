import { useEffect, useState } from 'react'

import GithubInfo from '@components/github-info'
import useApi from '@x-hooks/use-api'

export default function RepositoriesList({ repositories, onClick }) {
  const [existingRepos, setExistingRepos] = useState([])

  const { searchRepositories } = useApi()

  useEffect(() => {
    if (!repositories.length) return

    const paths = repositories.map(repository => repository.fullName).join(',')

    searchRepositories({
      path: paths
    }).then(({rows}) => {
      setExistingRepos(rows.map(repo => repo.githubPath))
    }).catch(console.log)
  }, [repositories])

  return (
    <div className="row mx-0 mb-4 justify-content-start repositories-list">
      <span className="caption-small text-gray px-0">Repositories</span>

      {repositories.map((repository) => (
        <GithubInfo
          key={repository.name}
          label={repository.name}
          active={repository.checked}
          onClick={() => onClick(repository.name)}
          variant="repository"
          parent="list"
          disabled={existingRepos.includes(repository.fullName)}
        />
      ))}

      {existingRepos.length ? <span className="p-small text-danger px-0">The highlighted repositories are already being used by another network.</span> : ''}
    </div>
  )
}
