import { NextApiRequest, NextApiResponse } from "next";

export default async function Health(
  req: NextApiRequest,
  res: NextApiResponse
) {
  res.status(204);
  res.end();
}
