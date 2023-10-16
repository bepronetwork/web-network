import { NextApiRequest, NextApiResponse } from "next";

import models from "db/models";

import { error as LogError } from "services/logging";

export default async function post(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { id } = req.query;
    const { banned_domain } = req.body;

    const network = await models.network.findOne({
      where: {
        id: +id,
      },
    });

    if(!banned_domain) 
      return res.status(404).json({ message: "banned_domain not found" });

    if (network.banned_domains.find((domain) => domain === banned_domain))
      return res.status(409).json({ message: "domain already exists" });

    network.banned_domains = [...network.banned_domains, banned_domain];
    await network.save();

    return res.status(200).json(network.banned_domains);
  } catch (error) {
    res.status(500).json(error);
    LogError(error);
  }
}
