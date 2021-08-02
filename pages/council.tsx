import {GetStaticProps} from 'next';
import React, {useContext, useEffect, useState} from 'react';
import {IIssue} from '../components/issue-list-item';
import ListIssues from '../components/list-issues';
import PageHero from '../components/page-hero';
import GithubMicroService from '../services/github-microservice';
import {mockReadyIssues} from '../helpers/mockdata/mockIssues';
import {ApplicationContext} from '../contexts/application';
import {changeLoadState} from '../contexts/reducers/change-load-state';

export default function PageCouncil() {
  const {dispatch} = useContext(ApplicationContext);
  const [issues, setIssues] = useState<IIssue[]>();

  function getIssues() {
    dispatch(changeLoadState(true))
    GithubMicroService.getIssuesState({filterState: `ready`})
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
      <PageHero title="Ready to propose"
                numIssuesInProgress={10}
                numIssuesClosed={12}
                numBeprosOnNetwork={120000} />
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
