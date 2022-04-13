import getConfig from "next/config";
import { TwitterApi } from "twitter-api-v2";

import { formatNumberToNScale } from "helpers/formatNumber";

import { IssueState } from "interfaces/issue-data";
const { publicRuntimeConfig, serverRuntimeConfig } = getConfig()
function handleState(currentState: IssueState) {
  switch (currentState) {
  case "draft": {
    return "𝗗𝗥𝗔𝗙𝗧";
  }
  case "open": {
    return "𝗢𝗣𝗘𝗡";
  }
  case "ready": {
    return "𝐑𝐄𝐀𝐃𝐘";
  }
  case "closed": {
    return "𝐂𝐋𝐎𝐒𝐄𝐃";
  }
  case "canceled": {
    return "𝗖𝗔𝗡𝗖𝗘𝗟𝗘𝗗";
  }
  default: {
    return;
  }
  }
}

export default function twitterTweet({
  type,
  action,
  issue,
  issuePreviousState,
  username
}: {
  type: "bounty" | "proposal";
  action:
    | "created"
    | "changes"
    | "solution"
    | "failed"
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
    githubId: string;
  };
}) {
  if (
    serverRuntimeConfig.twitter.apiKey && 
    serverRuntimeConfig.twitter.apiSecret && 
    serverRuntimeConfig.twitter.accessToken && 
    serverRuntimeConfig.twitter.accessSecret 
    ) {
    const twitterClient = new TwitterApi({
      appKey: serverRuntimeConfig.twitter.apiKey,
      appSecret: serverRuntimeConfig.twitter.apiSecret,
      accessToken: serverRuntimeConfig.twitter.accessToken,
      accessSecret: serverRuntimeConfig.twitter.accessSecret,
    });

    let title: string;
    let body: string;

    const currentState: string = handleState(issue.state);
    const previousState: string = handleState(issuePreviousState);
    const issueTitle =
      issue.title.length > 30 ? issue.title.slice(0, 30) + "..." : issue.title;
    const amount: string | number = formatNumberToNScale(issue.amount);

    if (type === "bounty" && action === "created") {
      title = "Alert";
      body = `${issueTitle} and earn up to ${amount} $BEPRO`;
    }
    if (type === "bounty" && action === "changes") {
      title = "Status Update";
      body = `${issueTitle} has changed its status from ${
        previousState && currentState
          ? `${previousState} to ${currentState}`
          : currentState
      }`;
    }
    if (type === "bounty" && action === "solution") {
      title = "Solution Found";
      body = `${username} has found a solution for the bounty ${issueTitle}`;
    }
    if (type === "bounty" && action === "distributed") {
      title = "Fully Distributed";
      body = `${issueTitle} was closed and fully distributed with ${amount} $BEPRO.`;
    }
    if (type === "proposal") {
      title = "Proposal Status";
      body = `A proposal ${
        action === "created" ? `was ${action}` : `has ${action}`
      } regarding the bounty ${issueTitle}`;
    }

    const Tweet = `
  ♾ Protocol Bounty ${title && title + "!"}

  ${body}
 
  ${publicRuntimeConfig.homeUrl}/bounty?id=${issue.githubId}&repoId=${
      issue.repository_id
    }
  `;

    if (Tweet.length < 280 && title && body) {
      twitterClient.v2
        .tweet(Tweet)
        .then((value) => {
          console.log("Tweet created successfully - tweet ID:", value.data.id);
        })
        .catch((err) => {
          console.log("Error creating Tweet ->", err);
        });
    } else {
      console.log("This Tweet cannot be created. Because it contains more than 280 characters");
    }
  } else {
    console.log(".env from Twitter configuration is missing");
    return;
  }
}
