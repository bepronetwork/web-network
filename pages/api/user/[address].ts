import { NextApiRequest, NextApiResponse } from "next";
import models from "@db/models";

async function remove(req: NextApiRequest, res: NextApiResponse) {
  const { address } = req.query;

  let user = await models.user.findOne({
    where: { address: address.toString().toLowerCase() },
  });

  if (!user) return res.status(404).json(`address not found`);

  const deleted = await user.destroy();

  res
    .status(!deleted ? 422 : 200)
    .json(!deleted ? `Couldn't delete entry ${address}` : `ok`);
}

export default async function User(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
    case "delete":
      await remove(req, res);
      break;

    default:
      res.status(405);
  }

  res.end();
}
