import ReactSelect from '@components/react-select';
import {useEffect, useState} from 'react';
import GithubMicroService from '@services/github-microservice';

export default function ReposDropdown({onSelected = (opt: {value}) => {}}) {
  const [reposList, setReposList] = useState<{ value: string; label: string }[]>();

  function loadReposFromBackend() {
    function mapRepo({id: value, githubPath: label}) {
      return ({value, label})
    }

    GithubMicroService.getReposList().then(repos => repos.map(mapRepo)).then(setReposList);
  }

  useEffect(loadReposFromBackend, [])

  return <div>
    <label className="smallCaption mb-2 text-uppercase">
      Select a repository
    </label>
    <ReactSelect options={reposList} onChange={onSelected} />
    </div>
}
