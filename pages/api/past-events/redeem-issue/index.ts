import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import { Octokit } from "octokit";
import { Op } from "sequelize";

import models from "db/models";

import networkBeproJs from "helpers/api/handle-network-bepro";
import twitterTweet from "helpers/api/handle-twitter-tweet";
import { Bus } from "helpers/bus";
import { handleNetworkAddress } from 'helpers/custom-network';

import api from "services/api";

const { publicRuntimeConfig } = getConfig()

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { fromBlock, id, networkName } = req.body;

  const customNetwork = await models.network.findOne({
    where: {
      name: {
        [Op.iLike]: String(networkName)
      }
    }
  });

  if (!customNetwork) return res.status(404).json("Invalid network");
  if (customNetwork.isClosed) return res.status(404).json("Invalid network");

  const octokit = new Octokit({ auth: publicRuntimeConfig.github.token });

  const network = networkBeproJs({ contractAddress: handleNetworkAddress(customNetwork.networkAddress) });

  await network.start();

  await network
    .getRedeemIssueEvents({
      fromBlock,
      toBlock: +fromBlock + 1,
      filter: { id }
    })
    .then(async function redeemIssues(events) {
      for (const event of events) {
        const eventData = event.returnValues;
        const issueId = await network
          .getIssueById(eventData.id)
          .then(({ cid }) => cid);
        const issue = await models.issue.findOne({ where: { issueId } });

        if (!issue || issue?.state === "canceled") {
          console.log(`Emitting redeemIssue:created:${issueId}`);
          Bus.emit(`redeemIssue:created:${issueId}`, issue);
          return console.log("Failed to find an issue to redeem or already redeemed",
                             event);
        }

        const repoInfo = await models.repositories.findOne({
          where: { id: issue?.repository_id }
        });
        const [owner, repo] = repoInfo.githubPath.split("/");
        await octokit.rest.issues.update({
          owner,
          repo,
          issue_number: +issue.githubId,
          state: "closed"
        });
        issue.state = "canceled";

        if (network.contractAddress === publicRuntimeConfig.contract.address)
          twitterTweet({
            type: "bounty",
            action: "changes",
            issuePreviousState: "draft",
            issue
          });

        await issue.save();

        await api.post(`/seo/${issueId}`).catch((e) => {
          console.log("Error creating SEO", e);
        });

        console.log(`Emitting redeemIssue:created:${issueId}`);
        Bus.emit(`redeemIssue:created:${issueId}`, issue);
        res.status(204);
      }
    })
    .catch((error) => {
      console.log("Error reading RedeemIssue", error);
      res.status(400);
    });
}

export default async function ParseRedeemIssue(req: NextApiRequest,
                                               res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "post":
    await post(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}
