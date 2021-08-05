import { GetStaticProps } from "next";
import React, {useContext, useEffect, useState} from 'react';
import PageHero from "../components/page-hero";
import GithubMicroService from "../services/github-microservice";
import ListIssues from "../components/list-issues";
import ReactSelect from "../components/react-select";
import {ApplicationContext} from '../contexts/application';
import {changeLoadState} from '../contexts/reducers/change-load-state';
import {IssueData} from '../interfaces/issue-data';

const options_issue = [
  {
    value: "all",
    label: "All issues",
  },
  {
    value: "open",
    label: "Open issues",
  },
  {
    value: "in progress",
    label: "In progress issues",
  },
  {
    value: "ready",
    label: "Ready issues",
  },
  {
    value: "draft",
    label: "Draft issues",
  },
];

const options_time = [
  {
    value: "All time",
    label: "All time",
  },
];

export default function PageDevelopers() {
  const {dispatch, state: {loading}} = useContext(ApplicationContext);
  const [issues, setIssues] = useState<IssueData[]>([]);
  const [filterStateIssues, setfilterStateIssues] = useState({
    state: "",
    issues: [],
  });


  function handleChangeFilterIssue(params: { value: string; label: string; }) {
    if (params.value === "all") {
      setfilterStateIssues({
        state: params.value,
        issues,
      });
    } else {
      setfilterStateIssues({
        state: params.value,
        issues: issues.filter(
          (obj: IssueData) => obj.state.toLowerCase() === params.value
        ),
      });
    }
  }

  function updateIssuesList(issues: IssueData[]) {
    console.log(`got issues`, issues);
    setIssues(issues);
    if (filterStateIssues.issues.length === 0) {
      setfilterStateIssues({ state: "all", issues });
    }
  }

  function getIssues() {
    dispatch(changeLoadState(true))
    GithubMicroService.getIssues()
                      .then(updateIssuesList)
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
      <PageHero title="Find issue to work"/>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-10">
            <div className="d-flex justify-content-between mb-4">
              <div className="col-md-3">
                <ReactSelect
                  id="filterIssue"
                  className="react-select-filterIssues"
                  defaultValue={options_issue[0]}
                  options={options_issue}
                  onChange={handleChangeFilterIssue}
                />
              </div>
              <div className="col-md-3">
                <ReactSelect
                  id="filterTime"
                  className="react-select-filterIssues trans"
                  defaultValue={options_time[0]}
                  options={options_time}
                  isDisabled
                />
              </div>
            </div>
          </div>
          <ListIssues listIssues={filterStateIssues.issues} />
          {filterStateIssues.issues.length === 0 && !loading ? (
            <div className="col-md-10">
              <h4>
                {filterStateIssues.state !== "all"
                  ? filterStateIssues.state
                  : null}{" "}
                issues not found
              </h4>
            </div>
          ) : null}
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
