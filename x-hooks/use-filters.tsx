import {useEffect, useState} from 'react';
import {IssueFilterBoxOption} from '@interfaces/filters';
import GithubMicroService from '@services/github-microservice';
import {RepoInfo} from '@interfaces/repos-list';
import {subMonths, subWeeks, subYears} from 'date-fns';

type FilterStateUpdater = (opts: IssueFilterBoxOption[], opt: IssueFilterBoxOption, checked: boolean, type: ('time' | 'repo' | 'state'), multi?: boolean) => void;

export default function useFilters(): [IssueFilterBoxOption[][], FilterStateUpdater] {

  const [stateFilters, setStateFilters] = useState<IssueFilterBoxOption[]>([]);
  const [timeFilters, setTimeFilters] = useState<IssueFilterBoxOption[]>([]);
  const [repoFilters, setRepoFilters] = useState<IssueFilterBoxOption[]>([]);

  function makeFilterOption(label, value, checked = false) {
    return {label, value, checked}
  }

  const All = makeFilterOption(`All`, `all`, true);

  function loadRepos() {

    function mapRepo({id: value, githubPath: label,}: RepoInfo) {
      return makeFilterOption(label, value);
    }

    GithubMicroService.getReposList()
                      .then(repos => [makeFilterOption(`All`, `allrepos`, true)].concat(repos.map(mapRepo)))
                      .then(setRepoFilters)
  }

  function loadFilters() {
    setStateFilters([
                      makeFilterOption(`All`, `allstates`, true),
                      makeFilterOption(`Open Issues`, `open`),
                      makeFilterOption(`Draft Issues`, `draft`),
                      makeFilterOption(`Closed Issues`, `closed`),])

    setTimeFilters([
                     makeFilterOption(`All`, `alltime`, true),
                     makeFilterOption(`Past Week`, +subWeeks(+new Date(), 1)),
                     makeFilterOption(`Past Month`, +subMonths(+new Date(), 1)),
                     makeFilterOption(`Past Year`, +subYears(+new Date(), 1)),])
  }

  useEffect(loadFilters, [])
  useEffect(loadRepos, [])

  function updateOpt(opts: IssueFilterBoxOption[], opt: IssueFilterBoxOption, checked: boolean, type: `time` | `repo` | `state`, multi = false): void {
    const tmp: IssueFilterBoxOption[] = [...opts];

    console.log(`Passing on ${type}`, opts, opt, checked);

    if (multi)
      tmp.find(o => o.value === opt.value).checked = checked;
    else tmp.forEach(o => o.checked = o.value === opt.value ? checked : false)

    if (type === 'time')
      setTimeFilters(tmp);
    else if (type === 'state')
      setStateFilters(tmp);
    else setRepoFilters(tmp);
  }

  return [[repoFilters, stateFilters, timeFilters,], updateOpt]
}
