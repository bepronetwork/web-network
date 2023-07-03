import {useEffect, useState} from "react";

import {useRouter} from "next/router";

import {useAppState} from "contexts/app-state";

import {IssueFilterBoxOption} from "interfaces/filters";
import {RepoInfo} from "interfaces/repos-list";

import useApi from "x-hooks/use-api";

type FiltersTypes = "time" | "repo" | "state";

type FilterStateUpdater = (
  opts: IssueFilterBoxOption[],
  opt: IssueFilterBoxOption,
  checked: boolean,
  type: FiltersTypes,
  multi?: boolean
) => void;

export default function useFilters(): [
  IssueFilterBoxOption[][],
  FilterStateUpdater,
  () => void,
  (option: IssueFilterBoxOption, type: FiltersTypes) => void,
  () => void,
] {
  const router = useRouter();

  const [timeFilters, setTimeFilters] = useState<IssueFilterBoxOption[]>([]);
  const [repoFilters, setRepoFilters] = useState<IssueFilterBoxOption[]>([]);
  const [stateFilters, setStateFilters] = useState<IssueFilterBoxOption[]>([]);

  const {state} = useAppState();
  const { getReposWithBounties } = useApi();

  const isOnNetwork = router?.pathname?.includes("[network]");

  function getActiveFiltersOf(opts: IssueFilterBoxOption[]) {
    return opts
      .filter(({ checked, label }) => checked && label !== "All")
      .map(({ value }) => value)
      .join(",");
  }

  function updateRouterQuery() {
    const state = getActiveFiltersOf(stateFilters);
    const time = getActiveFiltersOf(timeFilters);
    const repoId = getActiveFiltersOf(repoFilters);

    const query = {
      ...router.query,
      ...(state !== "" ? { state } : { state: undefined }),
      ...(time !== "" ? { time } : { time: undefined }),
      ...(repoId !== "" ? { repoId } : { repoId: undefined}),
      page: "1"
    };

    router.push({ pathname: router.pathname, query }, router.asPath, { shallow: false, scroll: false });
  }

  function makeFilterOption(label, value, checked = false) {
    return { label, value, checked };
  }

  function loadRepos() {
    function mapRepo({ id: value, githubPath: label }: RepoInfo) {
      return makeFilterOption(label,
                              value,
                              (router.query?.repoId as string) === value.toString());
    }

    if (isOnNetwork)
      setRepoFilters([
        makeFilterOption("All", "allrepos", !router.query?.repoId)]
        .concat(state.Service?.network?.repos?.list?.map(mapRepo)));
    else
        getReposWithBounties()
          .then(data => {
            setRepoFilters([
              makeFilterOption("All", "allrepos", !router.query?.repoId)]
              .concat(data.map(mapRepo)));
          });
  }

  function loadFilters() {
    const { time, state } = router.query || {};

    setStateFilters([
      makeFilterOption("All", "allstates", !state),
      makeFilterOption("Open Bounties", "open", state === "open"),
      makeFilterOption("Funding Bounties", "funding", state === "funding"),
      makeFilterOption("Draft Bounties", "draft", state === "draft"),
      makeFilterOption("Closed Bounties", "closed", state === "closed")
    ]);

    setTimeFilters([
      makeFilterOption("All", "alltime", !time),
      makeFilterOption("Past Week", "week", time === "week"),
      makeFilterOption("Past Month", "month", time === "month"),
      makeFilterOption("Past Year", "year", time === "year")
    ]);

    loadRepos();
  }

  useEffect(loadFilters, [router.query]);
  useEffect(loadRepos, [state.Service?.network?.repos?.list]);

  function updateOpt(opts: IssueFilterBoxOption[],
                     opt: IssueFilterBoxOption,
                     checked: boolean,
                     type: "time" | "repo" | "state",
                     multi = false): void {
    const tmp: IssueFilterBoxOption[] = [...opts];

    if (multi) tmp.find((o) => o.value === opt.value).checked = checked;
    else
      tmp.forEach((o) => (o.checked = o.value === opt.value ? checked : false));

    if (type === "time") setTimeFilters(tmp);
    else if (type === "state") setStateFilters(tmp);
    else setRepoFilters(tmp);

    updateRouterQuery();
  }

  function checkOption(option: IssueFilterBoxOption, type: FiltersTypes) {
    if (!option || !type) return;

    const updateChecked = (newChecked, options) => options.map(o => ({
      ...o,
      checked: o.value === newChecked.value ? true : false
    }));

    const checker = {
      repo: () => setRepoFilters(updateChecked(option, repoFilters)),
      time: () => setTimeFilters(updateChecked(option, timeFilters)),
      state: () => setStateFilters(updateChecked(option, stateFilters)),
    }

    checker[type]();
  }

  function clearFilters() {
    const query = {
      ...(router.query.sortBy ? { sortBy: router.query.sortBy } : { sortBy: undefined }),
      ...(router.query.order ? { order: router.query.order } : { order: undefined }),
      ...(router.query.search ? { search: router.query.search } : { search: undefined }),
      network: state.Service?.network?.active.name,
      page: "1"
    };

    router.push({ pathname: router.pathname, query }, router.asPath, { shallow: false, scroll: false });
  }

  return [[repoFilters, stateFilters, timeFilters], updateOpt, clearFilters, checkOption, updateRouterQuery];
}
