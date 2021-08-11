import { GetStaticProps } from "next";
import React, {useContext, useEffect, useState} from 'react';
import ListIssues from "../../components/list-issues";
import GithubMicroService from "../../services/github-microservice";
import Oracle from "../../components/oracle";
import {changeLoadState} from '../../contexts/reducers/change-load-state';
import {ApplicationContext} from '../../contexts/application';
import {IssueData} from '../../interfaces/issue-data';

export default function Newissues() {
  const {dispatch} = useContext(ApplicationContext);
  const [issues, setIssues] = useState<IssueData[]>();

  function getIssues() {
    dispatch(changeLoadState(true))
    GithubMicroService.getIssuesState({filterState: `draft`})
                      .then(setIssues)
                      .catch((error) => {
                        console.log('Error', error)
                      })
                      .finally(() => {
                        dispatch(changeLoadState(false))
                      });
  }

  useEffect(getIssues, []);

  return (
    <Oracle buttonPrimaryActive={true}>
      <ListIssues listIssues={issues} />
    </Oracle>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
