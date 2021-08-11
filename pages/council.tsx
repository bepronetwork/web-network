import {GetStaticProps} from 'next';
import React, {useContext, useEffect, useState} from 'react';
import {IssueData} from '../interfaces/issue-data';
import ListIssues from '../components/list-issues';
import PageHero from '../components/page-hero';
import GithubMicroService from '../services/github-microservice';
import {mockReadyIssues} from '../helpers/mockdata/mockIssues';
import {ApplicationContext} from '../contexts/application';
import {changeLoadState} from '../contexts/reducers/change-load-state';

export default function PageCouncil() {
  const {dispatch} = useContext(ApplicationContext);
  const [issues, setIssues] = useState<IssueData[]>();

  function getIssues() {
    dispatch(changeLoadState(true))
    debugger;
    GithubMicroService.getIssuesState('ready')
                      .then(issues => {
                        setIssues(issues)
                        console.log(`got issues`, issues)
                      })
                      .catch((error) => {
                        console.log('Error', error)
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
