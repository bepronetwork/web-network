import models from '@db/models';
import {NextApiRequest, NextApiResponse} from 'next';

async function get(req: NextApiRequest, res: NextApiResponse) {
  const {id} = req.query;

  const merge = await models.mergeProposal.findOne({where: {id}});
  if (!merge)
    return res.status(404);
  
  return res.status(200).json(merge)
}

export default async function MergeProposal(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
    case 'get':
      await get(req, res);
      break;

    default:
      res.status(405);
  }
}
