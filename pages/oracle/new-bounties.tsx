import {GetServerSideProps, GetStaticProps} from 'next/types';
import React, {useContext, useEffect, useState} from 'react';
import ListIssues from '@components/list-issues';
import Oracle from '@components/oracle';
import {changeLoadState} from '@reducers/change-load-state';
import {ApplicationContext} from '@contexts/application';
import {IssueData} from '@interfaces/issue-data';
import NothingFound from '@components/nothing-found';
import usePage from '@x-hooks/use-page';
import useCount from '@x-hooks/use-count';
import Paginate from '@components/paginate';
import useMergeData from '@x-hooks/use-merge-data';
import InternalLink from '@components/internal-link';
import {getSession} from 'next-auth/react';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';
import { useTranslation } from 'next-i18next';

export default function Newissues() {
  const {dispatch} = useContext(ApplicationContext);
  const [issues, setIssues] = useState<IssueData[]>();
  const page = usePage();
  const results = useCount();
  const {getIssues: getIssuesWith} = useMergeData();
  const { t } = useTranslation(['common', 'bounty'])

  function getIssues() {
    dispatch(changeLoadState(true))
    getIssuesWith({state: 'draft', page})
                      .then(data => {
                        results.setCount(data.count);
                        setIssues(data.rows)
                      })
                      .catch((error) => {
                        console.error('getIssuesState Error', error)
                      })
                      .finally(() => {
                        dispatch(changeLoadState(false))
                      });
  }

  useEffect(getIssues, [page]);

  return (
    <Oracle buttonPrimaryActive={true}>
      <>
        <ListIssues listIssues={issues} />
        {issues?.length !== 0 && <Paginate count={results.count} />}
        {
          issues?.length === 0 &&
          <div className="mt-4">
            <NothingFound
              description={t('bounty:errors.no-bounties-in-draft')}>
              <InternalLink href="/create-bounty" label={String(t('actions.create-one'))} uppercase />
            </NothingFound>
          </div>
          || ``
        }
      </>
    </Oracle>
  );
}

export const getServerSideProps: GetServerSideProps = async ({locale}) => {
  return {
    props: {
      session: await getSession(),
      ...(await serverSideTranslations(locale, ['common', 'bounty', 'oracle'])),
    },
  };
};
