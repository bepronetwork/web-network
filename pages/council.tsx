import {GetStaticProps} from 'next';
import React, {useContext, useEffect, useState} from 'react';
import Link from 'next/link';
import {IssueData} from '@interfaces/issue-data';
import ListIssues from '@components/list-issues';
import PageHero from '@components/page-hero';
import GithubMicroService from '@services/github-microservice';
import {ApplicationContext} from '@contexts/application';
import {changeLoadState} from '@reducers/change-load-state';
import NothingFound from '@components/nothing-found';

export default function PageCouncil() {
  const {dispatch} = useContext(ApplicationContext);
  const [issues, setIssues] = useState<IssueData[]>();

  function getIssues() {
    dispatch(changeLoadState(true))
    GithubMicroService.getIssuesState('ready')
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
      <PageHero title="Ready to propose" />
      <div className="container">
        <div className="row justify-content-center">
          <ListIssues listIssues={issues}/>
          {
            issues?.length === 0 &&
            <div className="mt-4">
              <NothingFound 
              description="No issues ready to propose"
              action={
                <Link href="/create-issue" passHref>
                  <button className="btn btn-md btn-primary">
                    create one
                  </button>
                </Link>
              } />
            </div>
          }
        </div>
      </div>
    </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
