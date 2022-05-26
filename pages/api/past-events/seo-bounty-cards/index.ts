import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";

import models from "db/models";
import nodeHtmlToImage from "node-html-to-image";
import axios from "axios";

import IpfsStorage from "services/ipfs-service";

const { publicRuntimeConfig } = getConfig();

async function get(req: NextApiRequest, res: NextApiResponse) {
  try {
    const include = [
      { association: "developers" },
      { association: "pullRequests" },
      { association: "mergeProposals" },
      { association: "repository" },
      { association: "token" },
    ];

    const issues = await models.issue.findAll({
      include
    });

    if (issues?.length < 1) return res.status(400).json("issues not find");

    const created = [];

    const baseUrl = publicRuntimeConfig.homeUrl;
    const background = `${baseUrl}/images/bg-bounty-card.png`;
    const logo = `${baseUrl}/images/bepro-icon.png`;
    const font = `${baseUrl}/fonts/SpaceGrotesk.woff2`;
    const { data: html } = await axios.get(`${baseUrl}/templates/seo/bounty.html`)

    for (const issue of issues) {
      const [, repo] = issue?.repository.githubPath.split("/");
      const [, ghId] = issue?.issueId.split("/");

      const content = {
        state: issue.state,
        issueId: ghId,
        title: issue.title,
        repo,
        ammount: issue.amount,
        working: issue.working?.length || 0,
        proposals: issue?.mergeProposals?.length || 0,
        pullRequests: issue.pullRequests?.length || 0,
        currency: issue?.token?.symbol,
        background,
        logo,
        font,
      }

      const card = await nodeHtmlToImage({
        html,
        type: "jpeg",
        content
      });

      const data = Buffer.from(card as String);
      const response = await IpfsStorage.add(data);

      if (response && response.hash) {
        await issue.update({ seoImage: response.hash });
        created.push({ issueId: issue?.issueId, seoImage: response.hash });
      }
    }

    return res.status(200).json(created);
  } catch (e) {
    console.error(e)
    return res.status(500).json('Internal Error')
  }
}

export default async function GetIssues(req: NextApiRequest,
                                        res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}
