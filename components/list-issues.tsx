import { GetStaticProps } from "next";
import React from "react";
import IssueListItem, { IIssue } from "../components/issue-list-item";

export default function ListIssues({
  listIssues,
  className = "col-md-10",
}: {
  listIssues: [IIssue];
  className?: string;
}): JSX.Element {
  function list() {
    if (listIssues && listIssues.length > 0) {
      return listIssues.map((issue) => (
        <div className={className} key={issue.issueId}>
          <IssueListItem issue={issue}></IssueListItem>
        </div>
      ));
    } else {
      return (
        <div className={className}>
          <h3>No issues ready to propose</h3>
        </div>
      );
    }
  }

  return <>{list()}</>;
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
