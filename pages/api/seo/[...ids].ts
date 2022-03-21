import axios from "axios";
import models from "db/models";
import { NextApiRequest, NextApiResponse } from "next";
import { Op } from "sequelize";

// import { generateCard } from "helpers/seo/create-card-bounty";

// import IpfsStorage from "services/ipfs-service";

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

  const url = `${process.env.NEXT_PUBLIC_IPFS_BASE}/${issue.seoImage}`;

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
  const {
    ids: [repoId, ghId]
  } = req.query;
  const issueId = [repoId, ghId].join("/");

  const include = [
    { association: "developers" },
    { association: "pullRequests" },
    { association: "mergeProposals" },
    { association: "repository" }
  ];

  const issue = await models.issue.findOne({
    where: { issueId },
    include
  });

  if (!issue) return res.status(404).json(null);

  const [, repo] = issue.repository.githubPath.split("/");

  // const card = await generateCard({
  //   state: issue.state,
  //   issueId: ghId,
  //   title: issue.title,
  //   repo,
  //   ammount: issue.amount,
  //   working: issue.working?.length || 0,
  //   pr: issue.pullRequests?.length || 0,
  //   proposal: issue?.mergeProposals?.length || 0
  // }).catch((e) => {
  //   console.log("Error generating card", e);
  //   return null;
  // });

  // if (!card) return;

  // const img = Buffer.from(card.buffer);
  // const { hash } = await IpfsStorage.add(img).catch((e) => {
  //   console.log("Failed to upload to IPFS", e);
  //   return { hash: null };
  // });

  // await issue.update({ seoImage: hash });

  return res.status(200).json({ seoImage: 'hash' });
}

export default async function Seo(req: NextApiRequest, res: NextApiResponse) {
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
