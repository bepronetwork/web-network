import { NextApiRequest, NextApiResponse } from "next";

import models from "db/models";

async function patch(req: NextApiRequest, res: NextApiResponse) {
  const { githubHandle } = req.body;

  const where = !req.body.migrate
    ? { githubHandle }
    : { address: req.body.wallet };

  let user = await models.user.findOne({ where });

  if (user === null)
    user = await models.user.findOne({ where: { address: req.body.wallet } });

  if (user === null) return res.status(400).json("Spam Error: user not found");

  if (user.address && !req.body.migrate && user.githubHandle)
    return res.status(409).json("Spam Error: user already joined");

  await user.update({
    githubHandle: user.githubHandle || githubHandle,
    githubLogin: user.githubLogin,
    address: req.body.wallet,
    accessToken: req.body.accessToken
  });

  return res.status(204).json("ok");
}

export default async function ConnectUser(req: NextApiRequest,
                                          res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "patch":
    await patch(req, res);
    break;

  default:
    res.status(405);
  }

  res.end();
}
