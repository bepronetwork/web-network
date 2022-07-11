import { NextApiRequest, NextApiResponse } from "next";

async function post(req: NextApiRequest, res: NextApiResponse) {

}

export default async function Github(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
    case 'post':
      await post(req, res);
      break;

    default:
      res.status(405).json(`Method not allowed`);
  }

  res.end();
}
