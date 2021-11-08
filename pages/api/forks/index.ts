import {NextApiRequest, NextApiResponse} from 'next';

function get(req: NextApiRequest, res: NextApiResponse) {

}

export default async function RepoRoute(req: NextApiRequest, res: NextApiResponse) {

  switch (req.method.toLowerCase()) {
    case 'get':
      await get(req, res);
      break;

    default:
      res.status(405);
  }

  res.end();
}
