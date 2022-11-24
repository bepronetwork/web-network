import {NextApiRequest, NextApiResponse} from "next";

import models from "db/models";

import {Settings} from "helpers/settings";

async function get(_req: NextApiRequest, res: NextApiResponse) {
  const settings = await models.settings.findAll({
    where: { visibility: "public" },
    raw: true,
  });

  const settingsList = new Settings(settings);

  return res.status(200).json(settingsList.raw());
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
  case "GET":
    await get(req, res);
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}