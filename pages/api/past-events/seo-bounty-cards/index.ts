import { NextApiRequest, NextApiResponse } from "next";

import models from "db/models";

// import { generateCard } from "helpers/seo/create-card-bounty";

// import IpfsStorage from "services/ipfs-service";

async function get(req: NextApiRequest, res: NextApiResponse) {
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

  // const created = [];

  // for (const issue of issues) {
    // const [, repo] = issue?.repository.githubPath.split("/");
    // const [, ghId] = issue?.issueId.split("/");

    // console.log("Parsing issue", issue?.issueId, repo, issue?.title);

    // const card = await generateCard({
    //   state: issue?.state,
    //   issueId: ghId,
    //   title: issue?.title,
    //   repo,
    //   ammount: issue?.amount,
    //   working: issue?.working?.length || 0,
    //   pr: issue?.pullRequests?.length || 0,
    //   proposal: issue?.mergeProposals?.length || 0,
    //   currency: issue?.token?.symbol
    // });

    // const data = Buffer.from(card.buffer);
    // const response = await IpfsStorage.add(data);

    // if (response && response.hash) {
    //   await issue.update({ seoImage: response.hash });
    //   created.push({ issueId: issue?.issueId, seoImage: response.hash });
    // }
  // }

  return res.status(200).json('created');
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
