import React, {useContext, useEffect, useState} from 'react';
import {useRouter} from 'next/router';
import {getSession} from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import {GetServerSideProps} from 'next/types';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';

import PageHero from "@components/page-hero";
import ListIssues from '@components/list-issues';

import {ApplicationContext} from '@contexts/application';

import {changeLoadState} from '@reducers/change-load-state';

import {IssueData} from '@interfaces/issue-data';

import usePage from '@x-hooks/use-page';
import useCount from '@x-hooks/use-count';
import useMergeData from '@x-hooks/use-merge-data';

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
