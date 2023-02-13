import {NextApiRequest, NextApiResponse} from "next";

import {Logger} from "services/logging";

Logger.changeActionName(`Health`);

export default function Health(req: NextApiRequest,
                               res: NextApiResponse) {
  res.status(200);
  res.end();
}
