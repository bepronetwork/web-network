import axios from "axios";
import { withCors } from "middleware";
import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";
import nodeHtmlToImage from "node-html-to-image";
import { Op } from "sequelize";

import models from "db/models";

import IpfsStorage from "services/ipfs-service";

const { publicRuntimeConfig } = getConfig();

async function get(req: NextApiRequest, res: NextApiResponse) {
  const {
    ids: [repoId, ghId]
  } = req.query;
  const issueId = [repoId, ghId].join("/");

  const issue = await models.issue.findOne({
    where: {
      issueId,
      seoImage: { [Op.not]: null }
    }
  });

  if (!issue) return res.status(404).json(null);

  const url = `${publicRuntimeConfig?.ipfsUrl}/${issue.seoImage}`;

  const { data } = await axios.get(url, {
    responseType: "arraybuffer"
  });

  res.writeHead(200, {
    "Content-Type": "image/png",
    "Content-Length": data?.length
  });

  return res.status(200).end(data);
}

async function post(req: NextApiRequest, res: NextApiResponse) {
  try {
    const {
      ids: [repoId, ghId]
    } = req.query;
    const issueId = [repoId, ghId].join("/");

    const include = [
      { association: "developers" },
      { association: "pullRequests" },
      { association: "mergeProposals" },
      { association: "repository" },
      { association: "token" }
    ];

    const issue = await models.issue.findOne({
      where: { issueId },
      include
    });

    if (!issue) return res.status(404).json(null);

    const [, repo] = issue.repository.githubPath.split("/");

    const baseUrl = publicRuntimeConfig.homeUrl;
    const background = `${baseUrl}/images/bg-bounty-card.png`;
    const logo = `${baseUrl}/images/bepro-icon.png`;
    const font = `${baseUrl}/fonts/SpaceGrotesk.woff2`;
    const { data: html } = await axios.get(`${baseUrl}/templates/seo/bounty.hbs`)

    const content = {
      state: issue.state,
      issueId: ghId,
      title: issue.title,
      repo,
      ammount: new Intl.NumberFormat('en').format(issue?.amount || 0),
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
    })

    if (!card) return;
    
    const img = Buffer.from(card as string);
    const { hash } = await IpfsStorage.add(img).catch((e) => {
      console.log("Failed to upload to IPFS", e);
      return { hash: null };
    });

    await issue.update({ seoImage: hash });

    return res.status(200).json({ seoImage: hash });
  }
  catch (e) { 
    return res.status(500).json("Internal Error");
  }
}

async function Seo(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  case "post":
    await post(req, res).catch((e) => {
      console.log("Error POST GetIssues", e);
    });
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}
export default withCors(Seo)