import { NextApiRequest, NextApiResponse } from "next";

import models from "db/models";

import { error as LogError } from "services/logging";

export default async function get(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;

    if(!id) return res.status(404).json({ message: "id not found" });

    const network = await models.network.findOne({
      where: {
        id: +id
      }
    })

    if(!network)
      return res.status(404).json({ message: "network not found" });

    return res.status(200).json(network.banned_domains);
  } catch (error) {
    LogError(error);
    res.status(500).json(error);
  }
}
