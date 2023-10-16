import {NextApiRequest, NextApiResponse} from "next";

import { withCORS } from "middleware";

import {Logger} from "services/logging";

Logger.changeActionName(`Health`);

async function Health(req: NextApiRequest, res: NextApiResponse) {
  res.status(200);
  res.end();
}

export default withCORS(Health);