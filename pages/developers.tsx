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
import LockedIcon from '@assets/icons/locked-icon';
import ReactSelect from '@components/react-select';
import Button from '@components/button';
import CloseIcon from '@assets/icons/close-icon';
import SearchIcon from '@assets/icons/search-icon';

export default function PageDevelopers() {
  const {dispatch, state: { loading }} = useContext(ApplicationContext);
  const [issues, setIssues] = useState<IssueData[]>([]);
  const mergedData = useMergeData();
  const { t } = useTranslation(['common', 'bounty']);
  
  const page = usePage();
  const results = useCount();
  const router = useRouter();
  const {repoId, time, state} = router.query as {repoId: string; time: string; state: string};

  function updateIssuesList(issues: IssueData[]) {
    setIssues(issues);
  }

  function getIssues() {
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
        
      <ListIssues listIssues={issues} />
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
