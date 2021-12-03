import { GetStaticProps } from 'next/types';
import React, {useContext, useEffect, useState} from 'react';
import ListIssues from '@components/list-issues';
import Oracle from '@components/oracle';
import {ApplicationContext} from '@contexts/application';
import {changeLoadState} from '@reducers/change-load-state';
import {IssueData} from '@interfaces/issue-data';
import NothingFound from '@components/nothing-found';
import usePage from '@x-hooks/use-page';
import useCount from '@x-hooks/use-count';
import Paginate from '@components/paginate';
import useMergeData from '@x-hooks/use-merge-data';
import InternalLink from '@components/internal-link';

export default function ReadyToMergeIssues() {
  const {dispatch} = useContext(ApplicationContext);
  const [issues, setIssues] = useState<IssueData[]>([]);
  const page = usePage();
  const results = useCount();
  const {getIssues: getIssuesWith} = useMergeData();

  function getIssues() {
    dispatch(changeLoadState(true))
    getIssuesWith({state: 'ready', page})
                      .then((data) => {
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

  useEffect(getIssues, []);

  return (
    <Oracle buttonPrimaryActive={false}>
      <ListIssues listIssues={issues} />
      {issues?.length !== 0 && <Paginate count={results.count} />}
      {
        issues?.length === 0 &&
        <div className="mt-4">
          <NothingFound
          description="No bounties ready to merge">
          <InternalLink href="/create-bounty" label="create one" uppercase />
        </NothingFound>
        </div>
      }
    </Oracle>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
