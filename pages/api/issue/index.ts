import {NextApiRequest, NextApiResponse} from "next";
import getConfig from "next/config";
import {Octokit} from "octokit";
import {Op} from "sequelize";

import models from "db/models";

import * as IssueQueries from "graphql/issue";
import * as RepositoryQueries from "graphql/repository";

import {GraphQlResponse} from "types/octokit";
import {chainFromHeader} from "../../../helpers/chain-from-header";
import WithCors from "../../../middleware/withCors";
import {WithValidChainId} from "../../../middleware/with-valid-chain-id";

const {serverRuntimeConfig} = getConfig();

async function post(req: NextApiRequest, res: NextApiResponse) {
  const {
    title,
    body,
    repositoryId,
    networkName
  } = req.body;

  const chain = await chainFromHeader(req);

  const network = await models.network.findOne({
    where: {
      name: {
        [Op.iLike]: String(networkName).replaceAll(" ", "-")
      },
      // chain_id: {[Op.eq]: +chain?.chainId}
    }
  });

  if (!network || network?.isClosed) return res.status(404).json("Invalid network");

  const repository = await models.repositories.findOne({
    where: { id: repositoryId, network_id: network.id }
  });

  if (!repository) return res.status(404).json("Repository not found");

  const [owner, repo] = repository.githubPath.split("/");

  const githubAPI = (new Octokit({ auth: serverRuntimeConfig?.github?.token })).graphql;

  const repositoryDetails = await githubAPI<GraphQlResponse>(RepositoryQueries.Details, {
    repo,
    owner
  });

  const repositoryGithubId = repositoryDetails.repository.id;
  let draftLabelId;

  if (!repositoryDetails.repository.labels.nodes.length) {
    const createdLabel = await githubAPI<GraphQlResponse>(RepositoryQueries.CreateLabel, {
      name: "draft",
      repositoryId: repositoryGithubId,
      color: "cfd3d7",
      headers: {
        accept: "application/vnd.github.bane-preview+json"
      }
    });

    draftLabelId = createdLabel.createLabel.label.id;
  } else draftLabelId = repositoryDetails.repository.labels.nodes[0].id;


  const createdIssue = await githubAPI<GraphQlResponse>(IssueQueries.Create, {
    repositoryId: repositoryGithubId,
    title,
    body,
    labelId: [draftLabelId]
  });

  const githubId = createdIssue.createIssue.issue.number;

  if (await models.issue.findOne({ where: { githubId: `${githubId}`, repository_id: repository.id } }))
    return res.status(409).json("issueId already exists on database");

  await models.issue.create({
    issueId: `${repository.id}/${githubId}`,
    githubId: `${githubId}`,
    repository_id: repository.id,
    creatorAddress: '',
    creatorGithub: '',
    amount: 0,
    branch: '',
    state: "pending",
    title: '',
    body: body,
    network_id: network.id,
    chain_id: +(await chainFromHeader(req))?.chainId
  });

  return res.status(200).json(`${repository.id}/${githubId}`);
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "post":
    await post(req, res);
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}


export default WithCors(WithValidChainId(handler));