import models from '@db/models';
import {NextApiRequest, NextApiResponse} from 'next';
import {Octokit} from 'octokit';
import {generateCard} from '@helpers/seo/create-card-bounty'
import Jimp from 'jimp'
async function get(req: NextApiRequest, res: NextApiResponse) {
  const {ids: [repoId, ghId]} = req.query;
  const issueId = [repoId, ghId].join(`/`);

  const include = [
    { association: 'developers' },
    { association: 'pullrequests' },
    { association: 'merges' },
    { association: 'repository' },
  ]

  const issue = await models.issue.findOne({
    where: {issueId},
    include
  })

  if (!issue)
    return res.status(404).json(null);

  const octokit = new Octokit({auth: process.env.NEXT_PUBLIC_GITHUB_TOKEN});
  const [owner, repo] = issue.repository.githubPath.split(`/`);
  const {data} = await octokit.rest.issues.get({ owner, repo, issue_number: issue.githubId })

  const card = await generateCard({
    state: 'CLOSED',
    issueId: '404',
    title: 'Remove all getContract functions from Application and instead calling the Object directly',
    repo,
    ammount: '10000',
    working: 6,
    pr: 10,
    proposal: 8,
  })

  // const card = await generateCard({
  //   state: 'CLOSED',
  //   issueId: ghId,
  //   title: data.title,
  //   repo,
  //   ammount: '1000',
  //   working: issue.working.length,
  //   pr: issue.working.length,
  //   proposal: issue.merges.length,
  // })
  
  var img = Buffer.from(card.buffer, 'base64');

  res.writeHead(200, {
    'Content-Type': 'image/png',
    'Content-Length': img.length
  });
  res.end(img); 
  // return res.status(200).json(card);
}

export default async function GetIssues(req: NextApiRequest, res: NextApiResponse) {

  switch (req.method.toLowerCase()) {
    case 'get':
      await get(req, res);
      break;

    default:
      res.status(405).json(`Method not allowed`);
  }

  res.end();
}
