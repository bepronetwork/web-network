import {NextApiRequest, NextApiResponse} from "next";
import {Op} from "sequelize";

import models from "db/models";

import {chainFromHeader} from "helpers/chain-from-header";
import {resJsonMessage} from "helpers/res-json-message";

import {LogAccess} from "middleware/log-access";
import {WithValidChainId} from "middleware/with-valid-chain-id";
import WithCors from "middleware/withCors";

import {error} from "services/logging";

async function put(req: NextApiRequest, res: NextApiResponse) {
  const { issueId, pullRequestId, githubLogin, body, networkName, event } = req.body;

  const chain = await chainFromHeader(req);

  try {
    const network = await models.network.findOne({
      where: {
        name: {
          [Op.iLike]: String(networkName)
        },
        chain_id: {[Op.eq]: +chain?.chainId}
      }
    });

    if (!network || network?.isClosed)
      return resJsonMessage("Invalid network", res, 404);

    const issue = await models.issue.findOne({
      where: { issueId, network_id: network.id }
    });

    if (!issue) return res.status(404).json("Issue not found");

    const pullRequest = await models.pullRequest.findOne({
      where: { githubId: pullRequestId, issueId: issue.id }
    });

    if (!pullRequest) return res.status(404).json("Pull Request not found");
    
    if (!pullRequest.reviewers.find((el) => el === String(githubLogin))) {
      pullRequest.reviewers = [...pullRequest.reviewers, githubLogin];

      await pullRequest.save();
    }

    return res.status(200).json(pullRequest);
  } catch (e) {
    error(e);
    return res.status(e.status || 500).json(e?.errors && {
      data: e.response?.data,
      errors: e.response?.error
    } || e);
  }
}

async function PullRequestReview(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "put":
    await put(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}

export default  LogAccess(WithCors(WithValidChainId(PullRequestReview)));
