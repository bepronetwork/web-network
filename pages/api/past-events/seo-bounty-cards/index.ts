import models from '@db/models';
import {NextApiRequest, NextApiResponse} from 'next';
import {generateCard} from '@helpers/seo/create-card-bounty'
import IpfsStorage from '@services/ipfs-service';

async function get(req: NextApiRequest, res: NextApiResponse) {

  const include = [
    { association: 'developers' },
    { association: 'pullRequests' },
    { association: 'mergeProposals' },
    { association: 'repository' },
  ]

  const issues = await models.issue.findAll({
    where: {seoImage: null},
    include,
  })

  if (issues?.length < 1)
    return res.status(400).json('issues not find');


  const storage = new IpfsStorage()

  const create = Promise.all(issues.map(async (issue)=>{
    console.log(issue?.issueId.split(`/`))
    const [, repo] = issue?.repository.githubPath.split(`/`);
    const [, ghId] = issue?.issueId.split(`/`);
    console.log(issue.title)
    const card = await generateCard({
      state: issue?.state,
      issueId: ghId,
      title: issue?.title,
      repo,
      ammount: issue?.amount,
      working: issue?.working?.length || 0,
      pr: issue?.pullRequests?.length || 0,
      proposal: issue?.mergeProposals?.length || 0,
    })
    
    var img = Buffer.from(card.buffer, 'base64');
    const {path} = await storage.add({data: img})
    const url = `${process.env.NEXT_PUBLIC_IPFS_BASE}/${path}`

    await issue.update({
      seoImage: url,
    })

    return {...issue, seoImage: url};
  }))

  return res.status(200).json(create);
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
