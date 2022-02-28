import {NextApiRequest, NextApiResponse} from 'next';
import {Bus} from '@helpers/bus';

async function post(req: NextApiRequest, res: NextApiResponse) {
  const {eventName, networkName, ...rest} = req.body;

  return new Promise((resolve) => {
    if (eventName === `mergeProposal`) {
      const {githubLogin: login, issue_id: scId, currentGithubId: ghPrId} = rest;
      console.log(`Listening `, `mergeProposal:created:${login}:${scId}:${ghPrId}`);
      Bus.once(`mergeProposal:created:${login}:${scId}:${ghPrId}`, (merge) => resolve(res.json(merge)));
    }

    if (eventName === `closeIssue`) {
      const {currentGithubId: issueId} = rest;
      console.log(`Listening `, `closeIssue:created:${issueId}`);
      Bus.once(`closeIssue:created:${issueId}`, (issue) => resolve(res.json(issue)));
    }

    if (eventName === `redeemIssue`) {
      const {currentGithubId: issueId} = rest;
      console.log(`Listening redeemIssue:created:${issueId}`);
      Bus.once(`redeemIssue:created:${issueId}`, (issue) => resolve(res.json(issue)));
    }

  })

}

export default async function PollBody(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
    case 'post':
      await post(req, res);
      break;

    default:
      res.status(405);
  }
}
