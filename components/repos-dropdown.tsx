import ReactSelect from '@components/react-select';
import {useEffect, useState} from 'react';
import GithubMicroService from '@services/github-microservice';
import useRepos from '@x-hooks/use-repos';

export default function ReposDropdown({onSelected = (opt: {value}) => {}}) {
  const [[, repoList]] = useRepos();

  return <div>
    <label className="smallCaption mb-2 text-uppercase">
      Select a repository
    </label>
    <ReactSelect options={repoList} onChange={onSelected} />
    </div>
}
