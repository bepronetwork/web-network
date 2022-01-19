import {useEffect, useState} from 'react';
import {IssueFilterBoxOption} from '@interfaces/filters';
import {RepoInfo} from '@interfaces/repos-list';
import {useRouter} from 'next/router';
import useRepos from '@x-hooks/use-repos';
import useNetwork from './use-network';

type FilterStateUpdater = (opts: IssueFilterBoxOption[], opt: IssueFilterBoxOption, checked: boolean, type: ('time' | 'repo' | 'state'), multi?: boolean) => void;

export default function useFilters(): [IssueFilterBoxOption[][], FilterStateUpdater, () => void] {
  const [stateFilters, setStateFilters] = useState<IssueFilterBoxOption[]>([]);
  const [timeFilters, setTimeFilters] = useState<IssueFilterBoxOption[]>([]);
  const [repoFilters, setRepoFilters] = useState<IssueFilterBoxOption[]>([]);
  const [[, repoList]] = useRepos();

  const router = useRouter()
  const { network } = useNetwork()


  function getActiveFiltersOf(opts: IssueFilterBoxOption[]) {
    return opts.filter(({checked, label}) => checked && label !== `All`).map(({value}) => value).join(`,`);
  }

  function updateRouterQuery() {
    const state = getActiveFiltersOf(stateFilters);
    const time = getActiveFiltersOf(timeFilters);
    const repoId = getActiveFiltersOf(repoFilters);

    const query = {
      ... router.query,
      ... state ? {state} : {},
      ... time ? {time} : {},
      ... repoId ? {repoId} : {},
      page: '1'
    }

    router.push({pathname: router.pathname, query}, router.asPath);
  }

  function makeFilterOption(label, value, checked = false) {
    return {label, value, checked}
  }

  function loadRepos() {

    function mapRepo({id: value, githubPath: label}: RepoInfo) {
      return makeFilterOption(label, value, router.query?.repoId as string === value.toString());
    }

    setRepoFilters([makeFilterOption(`All`, `allrepos`, !router.query?.repoId)].concat(repoList.map(mapRepo)))
  }

  function loadFilters() {
    const {time, state, repoId} = router.query || {};

    setStateFilters([
                      makeFilterOption(`All`, `allstates`, !state),
                      makeFilterOption(`Open Bounties`, `open`, state === `ready` || state === `open`),
                      makeFilterOption(`Draft Bounties`, `draft`, state === `draft`),
                      makeFilterOption(`Closed Bounties`, `closed`, state === `closed`)])

    setTimeFilters([
                     makeFilterOption(`All`, `alltime`, !time),
                     makeFilterOption(`Past Week`, `week`, time === `week`),
                     makeFilterOption(`Past Month`, `month`, time === `month`),
                     makeFilterOption(`Past Year`, `year`, time === `year`),])

    loadRepos()
  }

  useEffect(loadFilters, [router.query])
  useEffect(loadRepos, [repoList])

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

  function clearFilters() {
    const query = {
      ... router.query.sortBy ? {sortBy: router.query.sortBy}: {},
      ... router.query.order ? {order: router.query.order}: {},
      ... router.query.search ? {search: router.query.search}: {},
      network: network.name,
      page: '1'
    }

    router.push({pathname: router.pathname, query}, router.asPath);
  }

  return [[repoFilters, stateFilters, timeFilters], updateOpt, clearFilters]
}
