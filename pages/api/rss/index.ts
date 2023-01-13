import Handlebars from "handlebars";
import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import { Op } from "sequelize";

import models from "db/models";

import { error as LogError } from 'services/logging';

import { rssTemplate } from "templates/rss";

const { publicRuntimeConfig } = getConfig();


async function get(req: NextApiRequest, res: NextApiResponse) {
  const { type = "all", limit = 50 } = req.query;

  try {
    if (!["open", "closed", "all"].includes(type.toString()))
      return res.status(403).json("Type must be open, closed or all");

    let where = {};

    if (type === "open")
      where = {
        state: {
          [Op.notIn]: ["draft", "closed", "canceled", "pending"]
        }
      };
    else if (type === "closed")
      where = {
        state: "closed"
      };
    else
      where = {
        state: {
          [Op.notIn]: ["canceled", "pending"]
        }
      };

    const bounties = await models.issue.findAll({
      where,
      limit: limit,
      include: [
        { association: "network" }
      ]
    });

    const homeUrl = publicRuntimeConfig?.urls?.home;
    const ipfsUrl = publicRuntimeConfig?.urls?.ipfs;

    const templateData = {
      appTitle: "Web3 Decentralized Development",
      appDescription: "Autonomous Protocol for Decentralized Development",
      appLink: homeUrl,
      bounties: bounties.map(({ title, createdAt, githubId, repository_id, seoImage, tags, network }) => ({
        title,
        description: `Created on ${network.name} Network.`,
        creationDate: new Date(createdAt).toUTCString(),
        link: `${homeUrl}/${network.name}/bounty?id=${githubId}&repoId=${repository_id}`,
        seoUrl: `${ipfsUrl}/${seoImage}`,
        tags: (tags || []).map( tag => ({ tag }))
      }))
    };

    const handlebar = Handlebars.compile(rssTemplate);

    const result = handlebar(templateData);

    return res
      .setHeader("Content-Type", "text/xml")
      .status(200)
      .send(result);
  } catch (error) {
    LogError("Failed to generate rss", { type, limit, error: error.toString() });
    return res.status(500).json(error);
  }
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}
