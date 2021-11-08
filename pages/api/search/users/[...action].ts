import {NextApiRequest, NextApiResponse} from 'next';
import models from '@db/models';
import {Op} from 'sequelize';

async function post(req: NextApiRequest, res: NextApiResponse) {
  const {action: [action]} = req.query;

  if (!action)
    return res.status(200).json(await models.user.findAll({raw: true,}));

  const users: string[] = req.body.map(s => s.toLowerCase());

  if (action === `login`)
    return res.status(200).json(await models.user.findAll({raw: true, where: {githubLogin: {[Op.in]: users}}}));

  if (action === `address`)
    return res.status(200).json(await models.user.findAll({raw: true, where: {address: {[Op.in]: users}}}));

  return res.status(404).json([]);

}

export default async function SearchUsers(req: NextApiRequest, res: NextApiResponse) {

  switch (req.method.toLowerCase()) {
    case 'post':
      await post(req, res);
      break;

    default:
      res.status(405);
  }

  res.end();
}
