import { GetStaticProps } from "next";
import { useRouter } from "next/router";
import React, { useContext } from "react";
import { formatDate } from "@helpers/formatDate";
import IssueAvatars from "./issue-avatars";
import { IssueData } from "@interfaces/issue-data";
import { IssueState } from "@interfaces/issue-data";
import { formatNumberToNScale } from "@helpers/formatNumber";
import Avatar from "components/avatar";
import GithubInfo from '@components/github-info';
import Translation from "./translation";

export default function IssueListItem({ issue = null, xClick }: { issue?: IssueData, xClick?: () => void; }) {
  const router = useRouter();

  function handleColorState(state: IssueState) {
    switch (state?.toLowerCase()) {
      case "draft": {
        return "bg-white-50";
      }
      case "open": {
        return "bg-blue text-white";
      }
      case "in progress": {
        return "bg-blue text-white";
      }
      case "canceled": {
        return "bg-dark-gray text-white";
      }
      case "closed": {
        return "bg-dark-gray text-white";
      }
      case "ready": {
        return "bg-success";
      }
      case "done": {
        return "bg-success";
      }
      case "disputed": {
        return "bg-danger text-white";
      }
      // REVIEW: redeem not exist in figma
      case "redeemed": {
        return "blue";
      }
      default: {
        return "blue";
      }
    }
  }


  return (
    <div
      className="bg-shadow list-item p-4 mb-3"
      onClick={() => {
        if (xClick)
          return xClick();

        router.push({
          pathname: "/bounty",
          query: { id: issue?.githubId, repoId: issue?.repository_id },
        });
      }}
    >
      <div className="row align-center">
        <div className="col-md-10 mb-3 mb-md-0">
          <h4 className="h4 text-truncate">
            <span className="text-gray trans me-2">#{issue?.githubId}</span>
            {(issue?.title || ``).length > 61
              ? (issue?.title || ``).substring(0, 61) + "..."
              : issue?.title || <Translation label={`bounty.errors.fetching`} />}
          </h4>
          <div className="d-flex align-center flex-wrap align-items-center justify-content-md-start mt-2">
            <span
              className={`status caption-small ${handleColorState(issue?.state)} mr-2`}
            >
              {issue && <Translation label={`bounty.status.${issue.state}`} />}
            </span>
            <span className="p-small mr-2 mt-1 text-gray trans">
              <Translation label={`misc.comments`} params={{
                  count: issue?.numberOfComments || 0
                }} 
              />
            </span>
            <span className="p-small mr-2 mt-1 text-gray trans">
              {issue != null && formatDate(issue?.createdAt)}
            </span>
            {issue?.repo && (
              <span className="p-small mr-2 mt-1 text-uppercase">
                <GithubInfo color="blue" value={issue?.repo} hoverTextColor="white" onClicked={() => router.push({pathname: `/`, query: {repoId: issue?.repository_id}})} />
              </span>
            )}
            <span className="p-small mr-2 mt-1 text-gray trans"><Translation label={`misc.by`} /></span>
            <span className="p-small mr-2 mt-1">
              <GithubInfo color="gray" value={[`@`, issue?.creatorGithub].join(``)} />
            </span>
            <Avatar className="mr-2" userLogin={issue?.creatorGithub} />
            {issue?.dueDate && (
              <span className="p-small text-warning mr-2 mt-1">
                {issue?.dueDate}
              </span>
            )}
          </div>
        </div>
        <div className="col-md-2 my-auto text-center">
          <span className="caption-large text-white text-opacity-1">
            {formatNumberToNScale(issue?.amount || 0)}{" "}
            <label className="text-uppercase text-blue"><Translation label={`$bepro`} /></label>
          </span>
          {issue?.developers?.length > 0 && (
            <IssueAvatars users={issue?.developers}></IssueAvatars>
          ) || ``}
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
