import { GetStaticProps } from 'next/types';
import React, {useContext, useEffect, useState} from 'react';
import ListIssues from '@components/list-issues';
import GithubMicroService from '@services/github-microservice';
import Oracle from '@components/oracle';
import {changeLoadState} from '@reducers/change-load-state';
import {ApplicationContext} from '@contexts/application';
import {IssueData} from '@interfaces/issue-data';
import NothingFound from '@components/nothing-found';
import usePage from '@x-hooks/use-page';
import useCount from '@x-hooks/use-count';
import Paginate from '@components/paginate';
import InternalLink from '@components/internal-link';

export default function Newissues() {
  const {dispatch} = useContext(ApplicationContext);
  const [issues, setIssues] = useState<IssueData[]>();
  const page = usePage();
  const results = useCount();

  function getIssues() {
    dispatch(changeLoadState(true))
    GithubMicroService.getIssuesState('draft', page)
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
              description="No issues in draft">
              <InternalLink href="/create-issue" passHref active>
                  create one
              </InternalLink>
            </NothingFound>
          </div>
          || ``
        }
      </>
    </Oracle>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
