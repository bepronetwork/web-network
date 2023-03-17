import {LogAccess} from "middleware/log-access";
import WithCors from "middleware/withCors";
import {NextApiRequest, NextApiResponse} from "next";
import {Op, WhereOptions} from "sequelize";

import models from "db/models";

async function getAllRepos(req, res) {
  const { networkName, withBounties } = req.query;

  const include = withBounties ? [
    { 
      association: "issues",
      attributes: [],
      required: true
    }
  ] : [];

  const where: WhereOptions = {};

  if (networkName) {
    const network = await models.network.findOne({
      where: {
        name: {
          [Op.iLike]: String(networkName).replaceAll(" ", "-")
        }
      }
    });
  
    if (!network) return res.status(404).json("Invalid network");

    where.network_id = network.id;
  }

  const repositories = await models.repositories.findAll({
    where,
    include
  });

  return res.status(200).json(repositories);
}

async function addNewRepo(req, res) {
  const issues = (await models.issue.findAndCountAll())?.count;
  if (issues)
    return res
      .status(422)
      .json("Database already has issues, can't do that now.");

  if (!req.body?.owner || !req.body?.repo)
    return res.status(422).json("wrong payload");

  const { owner, repo, networkName } = req.body;

  const found = await models.repositories.findOne({
    where: { githubPath: `${owner}/${repo}` }
  });
  if (found) return res.status(409).json("Path already exists");

  const network = await models.network.findOne({
    where: {
      name: {
        [Op.iLike]: String(networkName).replaceAll(" ", "-")
      }
    }
  });

  if (!network) return res.status(404).json("Invalid network");
  if (network.isClosed) return res.status(404).json("Invalid network");

  const created = await models.repositories
    .create({ githubPath: `${owner}/${repo}`, network_id: network.id })
    .then(() => ({ error: false }))
    .catch((e) => ({ error: e.message }));

  res
    .status(!created?.error ? 200 : 400)
    .json(!created?.error ? "ok" : created.error);
}

async function removeRepo(req: NextApiRequest, res: NextApiResponse) {
  const issues = (await models.issue.findAndCountAll())?.count;
  if (issues)
    return res
      .status(422)
      .json("Database already has issues, can't do that now.");

  const id = req.query.id;

  const found = await models.repositories.findOne({ where: { id } });
  if (!found) return res.status(404).json("id not found");

  const deleted = await found.destroy();

  res
    .status(!deleted ? 422 : 200)
    .json(!deleted ? `Couldn't delete entry ${id}` : "ok");
}

async function RepoRoute(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await getAllRepos(req, res);
    break;

  case "post":
    await addNewRepo(req, res);
    break;

  case "delete":
    await removeRepo(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}
export default LogAccess(WithCors(RepoRoute));