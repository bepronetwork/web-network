import {NextApiRequest, NextApiResponse} from 'next';
import {Bus} from '@helpers/bus';

async function get(req: NextApiRequest, res: NextApiResponse) {
  const {meta: [eventName, ...rest]} = req.query;

  return new Promise((resolve) => {
    if (eventName === `mergeProposal`) {
      const [login, scId, ghPrId] = rest;
      console.log(`Listening `, `mergeProposal:created:${login}:${scId}:${ghPrId}`);
      Bus.once(`mergeProposal:created:${login}:${scId}:${ghPrId}`, (merge) => resolve(res.json(merge)));
    }

    if (eventName === `closeIssue`) {
      const [issueId] = rest;
      console.log(`Listening `, `closeIssue:created:${issueId}`);
      Bus.once(`closeIssue:created:${issueId}`, (issue) => resolve(res.json(issue)));
    }

    if (eventName === `redeemIssue`) {
      const [issueId] = rest;
      console.log(`Listening redeemIssue:created:${issueId}`);
      Bus.once(`redeemIssue:created:${issueId}`, (issue) => resolve(res.json(issue)));
    }

  })

}

export default async function PollBody(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
    case 'get':
      await get(req, res);
      break;

    default:
      res.status(405);
  }
}
