import { IssueState } from "@interfaces/issue-data";
import { TwitterApi } from "twitter-api-v2";

export default function twitterTweet({
  type,
  action,
  issue,
  issuePreviousState,
  username,
}: {
  type: "bounty" | "proposal";
  action:
    | "created"
    | "changes"
    | "solution"
    | "failed"
    | "accepted"
    | "distributed"
    | "working";
  issuePreviousState?: IssueState;
  username?: string;
  issue: {
    id: string | number;
    repository_id: number;
    title: string;
    amount: number;
    state: IssueState;
  };
}) {
  const twitterClient = new TwitterApi({
    appKey: process.env.NEXT_TWITTER_APIKEY,
    appSecret: process.env.NEXT_TWITTER_APIKEY_SECRET,
    accessToken: process.env.NEXT_TWITTER_ACCESS_TOKEN,
    accessSecret: process.env.NEXT_TWITTER_ACCESS_SECRET,
  });

  var title: string;
  var body: string;
  const issueTitle =
    issue.title.length > 30 ? issue.title.slice(0, 30) + `...` : issue.title;

  if (type === "bounty" && action === "created") {
    title = "Alert";
    body = `${issueTitle} and earn up to ${issue.amount} $BEPRO`;
  }
  if (type === "bounty" && action === "changes") {
    title = "Status Update";
    body = `${issueTitle} has changed its status from ${
      issuePreviousState
        ? `${issuePreviousState} to ${issue.state}`
        : issue.state
    }`;
  }
  if (type === "bounty" && action === "solution") {
    title = "Solution Found";
    body = `${username} has found a solution for the bounty ${issueTitle}`;
  }
  if (type === "bounty" && action === "distributed") {
    title = "Fully Distributed";
    body = `${issueTitle} was closed and fully distributed with ${issue.amount} $BEPRO.`;
  }
  if (type === "proposal") {
    title = "Proposal Status";
    body = `A proposal ${
      action === "created" ? `was ${action}` : `has ${action}`
    } regarding the bounty ${issueTitle}`;
  }

  var Tweet = `
  ♾ Protocol Bounty ${title && title + "!"}

  ${body}
 
  - ${process.env.NEXT_PUBLIC_HOME_URL}/bounty?id=${issue.id}&repoId=${
    issue.repository_id
  }
  `;

  if (Tweet.length < 280 && title && body) {
    return twitterClient.v2
      .tweet(Tweet)
      .then(() => console.log("Tweet created successfully"))
      .catch((err) => console.log("Error creating Tweet ->", err));
  } else {
    return console.error(
      "This tweet cannot be created. Because it contains more than 280 characters"
    );
  }
}
