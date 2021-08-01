import { GetStaticProps } from "next";
import Link from "next/link";
import React, { useEffect, useState } from "react";
import AccountHero from "components/account-hero";
import IssueListItem, { IIssue } from "components/issue-list-item";
import GithubMicroService from "services/github-microservice";
import useAccount from "hooks/useAccount";

export default function MyIssues() {
  const account = useAccount();
  const [issues, setIssues] = useState<IIssue[]>([]);

  useEffect(() => {
    (async function getIssues() {
      try {
        if (account.issues.length) {
          const issues = await GithubMicroService.getIssues(account.issues);

          setIssues(issues);
        }
      } catch (error) {
        console.log("MyIssues getIssues", error);
      }
    })();
  }, []);

  return (
    <div>
      <AccountHero />
      <div className="container">
        <div className="row">
          <div className="d-flex justify-content-center mb-3">
            <Link href="/account/" passHref>
              <a className="subnav-item active mr-3 h3">My issues</a>
            </Link>
            <Link href="/account/my-oracles" passHref>
              <a className="subnav-item h3">My oracles</a>
            </Link>
          </div>
        </div>
      </div>
      <div className="container">
        <div className="row justify-content-center">
          {issues.map((issue) => (
            <div className="col-md-10" key={issue.issueId}>
              <IssueListItem issue={issue}></IssueListItem>
            </div>
          ))}
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
