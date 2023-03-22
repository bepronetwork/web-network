import {NextApiRequest, NextApiResponse} from "next";

import {Bus} from "helpers/bus";

import {LogAccess} from "middleware/log-access";
import WithCors from "middleware/withCors";

async function get(req: NextApiRequest, res: NextApiResponse) {
  const {
    info: [login, scId, ghPrId]
  } = req.query;
  return new Promise((resolve) => {
    console.log("Listening ",
                `mergeProposal:created:${login}:${scId}:${ghPrId}`);
    Bus.once(`mergeProposal:created:${login}:${scId}:${ghPrId}`, (merge) =>
      resolve(res.json(merge)));
  });
}

async function PollMergeProposal(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405);
  }
}

export default LogAccess(WithCors(PollMergeProposal));
