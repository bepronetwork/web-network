import axios from "axios";
import {NextApiRequest, NextApiResponse} from "next";
import {Op} from "sequelize";

import models from "db/models";

import {Settings} from "helpers/settings";

import {LogAccess} from "middleware/log-access";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const {
    ids: [issueId]
  } = req.query;

  const issue = await models.issue.findOne({
    where: {
      id: issueId,
      seoImage: { [Op.not]: null }
    }
  });

  if (!issue) return res.status(404).json(null);

  const settings = await models.settings.findAll({
    where: { 
      visibility: "public",
      group: "urls"
    },
    raw: true,
  });

  const defaultConfig = (new Settings(settings)).raw();
  
  if (!defaultConfig?.urls?.ipfs)
    return res.status(500).json("Missing ipfs url on settings");

  const url = `${defaultConfig.urls.ipfs}/${issue.seoImage}`;

  const { data } = await axios.get(url, {
    responseType: "arraybuffer"
  });

  res.writeHead(200, {
    "Content-Type": "image/png",
    "Content-Length": data?.length
  });

  return res.status(200).end(data);
}
async function Seo(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}
export default LogAccess(Seo);