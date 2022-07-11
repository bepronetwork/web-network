import {NextApiRequest, NextApiResponse} from 'next';
import models from '@db/models';
import {Op} from 'sequelize';
import paginate from '@helpers/paginate';

async function post(req: NextApiRequest, res: NextApiResponse) {
  const {action: [action,]} = req.query;

  const attributes = { exclude: ["accessToken"] };

  if (!action)
    return res.status(200).json(await models.user.findAll(paginate({raw: true, attributes}, req.body, [[req.body.sortBy || 'updatedAt', req.body.order || 'DESC']])));

  if (action === `login`)
    return res.status(200).json(await models.user.findAll({raw: true, attributes, where: {githubLogin: {[Op.in]: req.body || []}}}));

  if (action === `address`)
    return res.status(200).json(await models.user.findAll({raw: true, attributes, where: {address: {[Op.in]: (req.body || []).map(s => s.toLowerCase())}}}));

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
