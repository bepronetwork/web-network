import {GetServerSideProps, GetStaticProps} from 'next/types';
import React, {useContext, useEffect, useState} from 'react';
import PageHero from "@components/page-hero";
import ListIssues from '@components/list-issues';
import {ApplicationContext} from '@contexts/application';
import {changeLoadState} from '@reducers/change-load-state';
import {IssueData} from '@interfaces/issue-data';
import NothingFound from '@components/nothing-found';
import Paginate from '@components/paginate';
import usePage from '@x-hooks/use-page';
import useCount from '@x-hooks/use-count';
import {useRouter} from 'next/router';
import IssueFilters from '@components/issue-filters';
import useMergeData from '@x-hooks/use-merge-data';
import useRepos from '@x-hooks/use-repos';
import InternalLink from '@components/internal-link';
import {getSession} from 'next-auth/react';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';
import { BeproService } from '@services/bepro-service';

type Filter = {
  label: string;
  value: string;
  emptyState: string;
};

type FiltersByIssueState = Filter[];

export default function PageDevelopers() {
  const {dispatch, state: { loading }} = useContext(ApplicationContext);
  const [issues, setIssues] = useState<IssueData[]>([]);
  const mergedData = useMergeData();
  const { t } = useTranslation(['common', 'bounty']);
  
  const filtersByIssueState: FiltersByIssueState = [
    {
      label: t('filters.bounties.all'),
      value: 'all',
      emptyState: t('filters.bounties.not-found')
    },
    {
      label: t('filters.bounties.open'),
      value: 'open',
      emptyState: t('filters.bounties.open-not-found')
    },
    {
      label: t('filters.bounties.draft'),
      value: 'draft',
      emptyState: t('filters.bounties.draft-not-found')
    },
    {
      label: t('filters.bounties.closed'),
      value: 'closed',
      emptyState: t('filters.bounties.closed-not-found')
    }
  ];
  
  const [filterByState, setFilterByState] = useState<Filter>(filtersByIssueState[0]);

  const page = usePage();
  const results = useCount();
  const router = useRouter();
  const {repoId, time, state} = router.query as {repoId: string; time: string; state: string};

  function updateIssuesList(issues: IssueData[]) {
    setIssues(issues);
  }

  function getIssues() {
    BeproService.getDisputableTime().then(console.log)

    dispatch(changeLoadState(true))
    mergedData.getIssues({page, repoId, time, state})
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
      <PageHero />
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
          {issues?.length !== 0 && (
              <Paginate
                count={results.count}
                onChange={(page) =>
                  router.push({
                    pathname: router.pathname,
                    query: {
                      page,
                      state,
                      time,
                      repoId,
                    },
                  })
                }
              />
            )}
          {issues?.length === 0 && !loading.isLoading ? (
            <div className="col-md-10">
              <NothingFound
                description={filterByState.emptyState}>
                <InternalLink href="/create-bounty" label={String(t('actions.create-one'))} uppercase />
              </NothingFound>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  </>);
}

export const getServerSideProps: GetServerSideProps = async ({locale}) => {
  return {
    props: {
      session: await getSession(),
      ...(await serverSideTranslations(locale, ['common', 'bounty'])),
    },
  };
};
