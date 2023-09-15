import { NextApiRequest, NextApiResponse } from "next";

import models from "db/models";

import { resJsonMessage } from "helpers/res-json-message";

import { UserRoleUtils } from "server/utils/jwt";

export default async function del(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;

  const { context } = req.body;

  const isGovernor = UserRoleUtils.hasGovernorRole(context.token);

  console.log('isGovernor', isGovernor)

  const deliverable = await models.deliverable.findOne({
    where: {
      id: id,
      ... isGovernor ? {} : {userId: context.user.id}
    },
  });

  if (!deliverable) return resJsonMessage("Invalid", res, 409);

  if (deliverable.prContractId)
    return resJsonMessage("This deliverable already exists in the contract",
                          res,
                          409);

  await deliverable.destroy();

  return res.status(200).json("Deliverable Canceled");
}
