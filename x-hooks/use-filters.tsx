import {useEffect, useState} from 'react';
import {IssueFilterBoxOption} from '@interfaces/filters';
import GithubMicroService from '@services/github-microservice';
import {RepoInfo} from '@interfaces/repos-list';
import {subHours, subMonths, subWeeks, subYears} from 'date-fns';
import {useRouter} from 'next/router';

type FilterStateUpdater = (opts: IssueFilterBoxOption[], opt: IssueFilterBoxOption, checked: boolean, type: ('time' | 'repo' | 'state'), multi?: boolean) => void;

export default function useFilters(): [IssueFilterBoxOption[][], FilterStateUpdater] {
  const [stateFilters, setStateFilters] = useState<IssueFilterBoxOption[]>([]);
  const [timeFilters, setTimeFilters] = useState<IssueFilterBoxOption[]>([]);
  const [repoFilters, setRepoFilters] = useState<IssueFilterBoxOption[]>([]);

  const router = useRouter()


  function getActiveFiltersOf(opts: IssueFilterBoxOption[]) {
    return opts.filter(({checked, label}) => checked && label !== `All`).map(({value}) => value).join(`,`);
  }

  function updateRouterQuery() {
    const state = getActiveFiltersOf(stateFilters);
    const time = getActiveFiltersOf(timeFilters);
    const repoId = getActiveFiltersOf(repoFilters);
    
    const query = {
      ... state ? {state} : {},
      ... time ? {time} : {},
      ... repoId ? {repoId} : {},
    }

    router.push({pathname: './', query});
  }

  function makeFilterOption(label, value, checked = false) {
    return {label, value, checked}
  }

  function loadRepos() {

    function mapRepo({id: value, githubPath: label}: RepoInfo) {
      return makeFilterOption(label, value, router.query?.repoId as string === value.toString());
    }

    GithubMicroService.getReposList()
                      .then(repos => [makeFilterOption(`All`, `allrepos`, !router.query?.repoId)].concat(repos.map(mapRepo)))
                      .then(setRepoFilters)
  }

  function loadFilters() {
    const {time, state, repoId} = router.query || {};
    
    setStateFilters([
                      makeFilterOption(`All`, `allstates`, !state),
                      makeFilterOption(`Open Issues`, `open`, state === `ready` || state === `open`),
                      makeFilterOption(`Draft Issues`, `draft`, state === `draft`),
                      makeFilterOption(`Closed Issues`, `closed`, state === `closed`)])

    setTimeFilters([
                     makeFilterOption(`All`, `alltime`, !time),
                     makeFilterOption(`Past Week`, `week`, time === `week`),
                     makeFilterOption(`Past Month`, `month`, time === `month`),
                     makeFilterOption(`Past Year`, `year`, time === `year`),])
    if(repoFilters.length > 0 && repoId){
      const index = repoFilters.findIndex(repo => repo.value.toString() === repoId)
      if(index){
        repoFilters[index].checked = true;
        setRepoFilters([...repoFilters])
      }
    }
  }

  useEffect(loadFilters, [router.query])
  useEffect(loadRepos, [])

  function updateOpt(opts: IssueFilterBoxOption[], opt: IssueFilterBoxOption, checked: boolean, type: `time` | `repo` | `state`, multi = false): void {
    const tmp: IssueFilterBoxOption[] = [...opts];

    if (multi)
      tmp.find(o => o.value === opt.value).checked = checked;
    else tmp.forEach(o => o.checked = o.value === opt.value ? checked : false)

    if (type === 'time')
      setTimeFilters(tmp);
    else if (type === 'state')
      setStateFilters(tmp);
    else setRepoFilters(tmp);

    updateRouterQuery()
  }

  return [[repoFilters, stateFilters, timeFilters], updateOpt]
}
