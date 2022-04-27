import { subMilliseconds } from "date-fns";
import models from "db/models";
import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import { Octokit } from "octokit";
import { Op } from "sequelize";

import networkBeproJs from "helpers/api/handle-network-bepro";
import twitterTweet from "helpers/api/handle-twitter-tweet";

import api from "services/api";

const { publicRuntimeConfig } = getConfig()

async function post(req: NextApiRequest, res: NextApiResponse) {
  const customNetworks = await models.network.findAll({
    where: {
      name: {
        [Op.notILike]: `%${publicRuntimeConfig.networkConfig.networkName
}%`
      }
    }
  });

  [
    {
      id: 1,
      name: publicRuntimeConfig.networkConfig.networkName
,
      networkAddress: publicRuntimeConfig.contract.address,
    },
    ...customNetworks
  ].forEach(async (customNetwork) => {
    if (!customNetwork.name) return;

    console.log(`Moving issues of ${customNetwork.name} - ${customNetwork.networkAddress} to OPEN`);
    const network = networkBeproJs({
      contractAddress: customNetwork.networkAddress
    });

    await network.start();
    const redeemTime = (await network.redeemTime()) * 1000;

    const where = {
      createdAt: { [Op.lt]: subMilliseconds(+new Date(), redeemTime) },
      network_id: customNetwork.id,
      state: "draft"
    };

    const issues = await models.issue.findAll({ where });
    const octokit = new Octokit({ auth: publicRuntimeConfig.github.token });

    for (const issue of issues) {
      try {
        const repoInfo = await models.repositories.findOne({
          where: { id: issue.repository_id }
        });
        const [owner, repo] = repoInfo.githubPath.split("/");
        await octokit.rest.issues.removeLabel({
          owner,
          repo,
          issue_number: issue.githubId,
          name: "draft"
        });
      } catch (error) {
        // label not exists, ignoring
      }
      issue.state = "open";
      console.log(`Moved ${issue.issueId} to open`);
      await issue.save();

      if (network.contractAddress === publicRuntimeConfig.contract.address)
        twitterTweet({
          type: "bounty",
          action: "changes",
          issuePreviousState: "draft",
          issue
        });

      await api.post(`/seo/${issue.issueId}`).catch((e) => {
        console.log("Error creating SEO", e);
      });
    }
  });

  return res.status(200).json("Issues Moved to Open");
}

export default async function MoveToOpen(req: NextApiRequest,
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
