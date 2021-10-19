import { GetStaticProps } from 'next/types';
import React, {useContext, useEffect, useState} from 'react';
import Link from 'next/link';
import ListIssues from '@components/list-issues';
import GithubMicroService from '@services/github-microservice';
import Oracle from '@components/oracle';
import {ApplicationContext} from '@contexts/application';
import {changeLoadState} from '@reducers/change-load-state';
import {IssueData} from '@interfaces/issue-data';
import NothingFound from '@components/nothing-found';
import { Button } from 'react-bootstrap';
import usePage from '@x-hooks/use-page';
import useCount from '@x-hooks/use-count';
import Paginate from '@components/paginate';

export default function ReadyToMergeIssues() {
  const {dispatch} = useContext(ApplicationContext);
  const [issues, setIssues] = useState<IssueData[]>([]);
  const page = usePage();
  const results = useCount();

  function getIssues() {
    dispatch(changeLoadState(true))
    GithubMicroService.getIssuesState('ready', page)
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
      {issues.length !== 0 && <Paginate count={results.count} />}
      {
        issues?.length === 0 &&
        <div className="mt-4">
          <NothingFound
          description="No issues ready to merge">
          <Link href="/create-issue" passHref>
            <Button>
              create one
            </Button>
          </Link>
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
