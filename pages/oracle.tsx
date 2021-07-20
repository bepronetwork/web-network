import { GetStaticProps } from "next";
import React, { useEffect, useState } from "react";
import { IIssue } from "../components/issue-list-item";
import ListIssues from "../components/list-issues";
import PageHero from "../components/page-hero";
import GithubMicroService from "../services/github-microservice";
import { setLoadingAttributes } from "../providers/loading-provider";
import { isEmpty } from "lodash";
import clsx from "clsx";

export default function PageOracle() {
  const [issues, setIssues] = useState<IIssue[]>([]);
  const [newIssues, setNewIssues] = useState<IIssue[]>([]);
  const [readyIssues, setReadyIssues] = useState<IIssue[]>([]);
  const [activeButton, setActiveButton] = useState<Boolean>(true);

  useEffect(() => {
    getNewIssues();
  }, []);

  const getNewIssues = async () => {
    if (isEmpty(newIssues)) {
      setLoadingAttributes(true);
    }
    await GithubMicroService.getIssuesState({
      filterState: "draft",
    })
      .then((issues) => {
        setNewIssues(issues);
        activeButton && setIssues(issues);
      })
      .catch((error) => console.log("Error", error))
      .finally(() => setLoadingAttributes(false));
  };

  const getReadyToMergeIssues = async () => {
    if (isEmpty(readyIssues)) {
      setLoadingAttributes(true);
    }
    await GithubMicroService.getIssuesState({
      filterState: "ready",
    })
      .then((issues) => {
        setReadyIssues(issues);
        setIssues(issues);
      })
      .catch((error) => console.log("Error", error))
      .finally(() => setLoadingAttributes(false));
  };

  return (
    <div>
      <PageHero
        title="Approve issues"
        numIssuesInProgress={10}
        numIssuesClosed={12}
        numBeprosOnNetwork={120000}
      ></PageHero>
      <div className="container">
        <div className="row">
          <div className="d-flex justify-content-center mb-3">
            <button
              className={clsx("btn btn-oracle subnav-item mr-3", {
                active: activeButton,
              })}
              onClick={() => {
                setIssues(newIssues);
                setActiveButton(true);
                console.log("new issues", newIssues);
              }}
            >
              <h3 className="h3">New issues</h3>
            </button>
            <button
              className={clsx("btn btn-oracle subnav-item", {
                active: !activeButton,
              })}
              onClick={() => {
                setActiveButton(false);
                if(readyIssues.length === 0){
                    getReadyToMergeIssues()
                }else{
                    setIssues(readyIssues);
                }           
                console.log("ready to merge issues", readyIssues);
              }}
            >
              <h3 className="h3">Ready to merge</h3>
            </button>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row justify-content-center">
          <ListIssues listIssues={issues} />
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
