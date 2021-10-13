import { GetStaticProps } from 'next/types';
import React, {useContext, useEffect, useState} from 'react';
import Link from 'next/link';
import PageHero from "@components/page-hero";
import GithubMicroService from '@services/github-microservice';
import ListIssues from '@components/list-issues';
import ReactSelect from '@components/react-select';
import {ApplicationContext} from '@contexts/application';
import {changeLoadState} from '@reducers/change-load-state';
import {IssueData} from '@interfaces/issue-data';
import NothingFound from '@components/nothing-found';
import Button from '@components/button';
import Paginate from '@components/paginate';
import usePage from '@x-hooks/use-page';
import useCount from '@x-hooks/use-count';
import {useRouter} from 'next/router';
import IssueFilterBox from '@components/issue-filter-box';
import useFilters from '@x-hooks/use-filters';

type Filter = {
  label: string;
  value: string;
  emptyState: string;
};

type FiltersByIssueState = Filter[];

const filtersByIssueState: FiltersByIssueState = [
  {
    label: "All issues",
    value: 'all',
    emptyState: 'Issues not found'
  },
  {
    label: 'Open issues',
    value: 'open',
    emptyState: 'Open issues not found'
  },
  {
    label: 'Draft issues',
    value: 'draft',
    emptyState: 'Draft issues not found'
  },
  {
    label: 'Closed issues',
    value: 'closed',
    emptyState: 'Closed issues not found'
  }
];

const options_time = [
  {
    value: "All time",
    label: "All time",
  },
];

export default function PageDevelopers() {
  const {dispatch, state: {loading, currentAddress}} = useContext(ApplicationContext);
  const [issues, setIssues] = useState<IssueData[]>([]);
  const [filterByState, setFilterByState] = useState<Filter>(filtersByIssueState[0]);
  const [[repoOptions, stateOptions, timeOptions], updateOptions] = useFilters();


  const page = usePage();
  const results = useCount();
  const router = useRouter();
  const {repoId} = router.query;

  function handleChangeFilterByState(filter: Filter) {
    setFilterByState(filter);
  }

  function updateIssuesList(issues: IssueData[]) {
    setIssues(issues);
  }

  function getIssues() {
    dispatch(changeLoadState(true))
    GithubMicroService.getIssues(page, repoId as string)
                      .then(({rows, count}) => {
                        results.setCount(count);
                        return rows;
                      })
                      .then(updateIssuesList)
                      .catch((error) => {
                        console.error('Error fetching issues', error)
                      })
                      .finally(() => {
                        dispatch(changeLoadState(false))
                      });
  }

  useEffect(getIssues, [page, repoId]);

  const isDraftIssue = (issue: IssueData) => issue?.state === 'draft';
  const isClosedIssue = (issue: IssueData) => issue?.state === 'closed' || issue?.state === 'redeemed';
  const isOpenIssue = (issue: IssueData) => !isDraftIssue(issue) && !isClosedIssue(issue);

  const issuesFilteredByState = issues.filter(issue => {
    if (filterByState.value === 'all') return true;
    if (filterByState.value === 'open') return isOpenIssue(issue);
    if (filterByState.value === 'draft') return isDraftIssue(issue);
    if (filterByState.value === 'closed') return isClosedIssue(issue);
    }
  );

  return (<>
    <div>
      <PageHero title="Find issues to work on"/>
      <div className="container p-footer">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="d-flex justify-content-between mb-4">
              <div className="col-md-3">
                <IssueFilterBox title="timeframe" options={timeOptions} onChange={(opt, checked) => updateOptions(timeOptions, opt, checked, 'time')} />
                <IssueFilterBox title="issue state" options={stateOptions} onChange={(opt, checked) => updateOptions(stateOptions, opt, checked, 'state')} />
                <IssueFilterBox title="repository" options={repoOptions} onChange={(opt, checked) => updateOptions(repoOptions, opt, checked, 'repo')} />
              </div>
              <div className="col-md-3">
                <ReactSelect
                  id="filterByIssueState"
                  isSearchable={false}
                  className="react-select-filterIssues"
                  defaultValue={filtersByIssueState[0]}
                  options={filtersByIssueState}
                  onChange={handleChangeFilterByState}
                />
              </div>
            </div>
          </div>
          <ListIssues listIssues={issuesFilteredByState} />
          <Paginate count={results.count} onChange={(page) => router.push({pathname: `/`, query:{page}})} />
          {issuesFilteredByState.length === 0 && !loading.isLoading ? (
            <div className="col-md-10">
              <NothingFound
                description={filterByState.emptyState}>
                <Link href="/create-issue" passHref>
                  <Button>
                    create one
                  </Button>
                </Link>
              </NothingFound>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  </>);
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
