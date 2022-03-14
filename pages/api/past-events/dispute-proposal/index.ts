import { NextApiRequest, NextApiResponse } from "next";
import networkBeproJs from "@helpers/api/handle-network-bepro";
import models from "@db/models";
import twitterTweet from "@helpers/api/handle-twitter-tweet";
import { Op } from 'sequelize'
import { CONTRACT_ADDRESS } from "env";

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { fromBlock, id, networkName } = req.body;

  const customNetwork = await models.network.findOne({
    where: {
      name: {
        [Op.iLike]: String(networkName)
      }
    }
  })

  if (!customNetwork) return res.status(404).json('Invalid network')
  if (customNetwork.isClosed) return res.status(404).json('Invalid network')

  const network = networkBeproJs({ test: true, contractAddress: customNetwork.networkAddress });

  await network.start();
  const contract = await network.getWeb3Contract();

  await contract
    .getPastEvents(`DisputeMerge`, {
      fromBlock,
      toBlock: +fromBlock + 1,
      filter: { id },
    })
    .then(async function tweet(events) {
      for (const event of events) {
        const eventData = event.returnValues;
        const issueId = await network
          .getIssueById({ issueId: eventData.id })
          .then(({ cid }) => cid);
        const issue = await models.issue.findOne({ where: { issueId } });

        if (!issue)
          return console.log(
            "Error creating tweet proposal failed because the issue was not found"
          );

        if (network.contractAddress === CONTRACT_ADDRESS)
          twitterTweet({
            type: "proposal",
            action: "failed",
            issue,
          });
      }
    })
    .catch((error) => {
      console.log(`Error reading DisputeMerge`, error);
      res.status(400);
    });
}

export default async function ParseMergeCreateProposal(
  req: NextApiRequest,
  res: NextApiResponse
) {
  switch (req.method.toLowerCase()) {
    case "post":
      await post(req, res);
      break;

    default:
      res.status(405);
  }

  res.end();
}
