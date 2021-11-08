import ReactSelect from '@components/react-select';
import {useEffect, useState} from 'react';
import GithubMicroService from '@services/github-microservice';
import useRepos from '@x-hooks/use-repos';

export default function ReposDropdown({onSelected = (opt: {value}) => {}}) {
  const [[, repoList]] = useRepos();
  const [options, setOptions] = useState<{value: string; label: string}[]>();

  function loadReposFromBackend() {
    if (!repoList)
      return;

    function mapRepo({id: value, githubPath: label}) {
      return ({value, label})
    }

    setOptions(repoList.map(mapRepo));
  }

  useEffect(loadReposFromBackend, [repoList])

  return <div>
    <label className="smallCaption mb-2 text-uppercase">
      Select a repository
    </label>
    <ReactSelect options={options} onChange={onSelected} />
    </div>
}
