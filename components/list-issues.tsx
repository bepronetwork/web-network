import { GetStaticProps } from "next";
import React from "react";
import IssueListItem from "../components/issue-list-item";
import {IssueData} from '../interfaces/issue-data';

export default function ListIssues({
  listIssues = [],
  className = "col-md-10",
}: {
  listIssues: IssueData[];
  className?: string;
}): JSX.Element {
  return (
    <>
      {listIssues.map((issue) => (
        // todo: issueId sometimes returns null
        // <div className={className} key={issue.issueId}>
        <div className={className} key={issue.githubId}>
          <IssueListItem issue={issue}></IssueListItem>
        </div>
      ))}
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
