import React, {useContext, useEffect, useState} from 'react';
import {GetServerSideProps, GetStaticProps} from 'next';
import {IssueData} from '@interfaces/issue-data';
import ListIssues from '@components/list-issues';
import PageHero from '@components/page-hero';
import {ApplicationContext} from '@contexts/application';
import {changeLoadState} from '@reducers/change-load-state';
import NothingFound from '@components/nothing-found';
import InternalLink from '@components/internal-link';
import useMergeData from '@x-hooks/use-merge-data';
import usePage from '@x-hooks/use-page';
import {getSession} from 'next-auth/react';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

export default function PageCouncil() {
  const {dispatch} = useContext(ApplicationContext);
  const [issues, setIssues] = useState<IssueData[]>([]);
  const page = usePage();
  const {getIssues: getIssuesWith} = useMergeData();
  const { t } = useTranslation(['common', 'council'])

  function getIssues() {
    dispatch(changeLoadState(true))
    getIssuesWith({state: 'ready', page})
                      .then(data => data.rows)
                      .then(setIssues)
                      .catch((error) => {
                        console.error('getIssuesState Error', error)
                      })
                      .finally(() => {
                        dispatch(changeLoadState(false))
                      });
  }

  useEffect(getIssues, []);

  return (
    <div>
      <PageHero title={t('council:title')} />
      <div className="container p-footer">
        <div className="row justify-content-center">
          <ListIssues listIssues={issues}/>
          {
            issues?.length === 0 &&
            <div className="mt-4">
              <NothingFound
              description={t('council:empty')}>
                <InternalLink href="/create-bounty" label={String(t('actions.create-one'))} uppercase />
              </NothingFound>
            </div>
          }
        </div>
      </div>
    </div>
  );
}

export const getServerSideProps: GetServerSideProps = async ({locale}) => {
  return {
    props: {
      session: await getSession(),
      ...(await serverSideTranslations(locale, ['common', 'council'])),
    },
  };
};
