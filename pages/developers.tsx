import { GetStaticProps } from 'next/types';
import React, {useContext, useEffect, useState} from 'react';
import PageHero from "@components/page-hero";
import GithubMicroService from '@services/github-microservice';
import ListIssues from '@components/list-issues';
import ReactSelect from '@components/react-select';
import {ApplicationContext} from '@contexts/application';
import {changeLoadState} from '@reducers/change-load-state';
import {IssueData} from '@interfaces/issue-data';
import NothingFound from '@components/nothing-found';
import Paginate from '@components/paginate';
import usePage from '@x-hooks/use-page';
import useCount from '@x-hooks/use-count';
import {useRouter} from 'next/router';
import IssueFilterBox from '@components/issue-filter-box';
import useFilters from '@x-hooks/use-filters';
import IssueFilters from '@components/issue-filters';
import InternalLink from '@components/internal-link';

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

  const page = usePage();
  const results = useCount();
  const router = useRouter();
  const {repoId, time, state} = router.query;

  function updateIssuesList(issues: IssueData[]) {
    setIssues(issues);
  }

  function getIssues() {
    dispatch(changeLoadState(true))
    GithubMicroService.getIssues(page, repoId as string, time as string, state as string)
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

  useEffect(getIssues, [page, repoId, time, state]);

  return (<>
    <div>
      <PageHero title="Find issues to work on"/>
      <div className="container p-footer">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="d-flex justify-content-end mb-4">
              <div className="col-md-3">
                <IssueFilters />
              </div>
            </div>
          </div>
          <ListIssues listIssues={issues} />
          {issues?.length !== 0 && <Paginate count={results.count} onChange={(page) => router.push({pathname: `/`, query:{page}})} />}
          {issues?.length === 0 && !loading.isLoading ? (
            <div className="col-md-10">
              <NothingFound
                description={filterByState.emptyState}>
                <InternalLink href="/create-issue" passHref active>
                  create one
                </InternalLink>
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
