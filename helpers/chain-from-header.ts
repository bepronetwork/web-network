import {NextApiRequest} from "next";
import models from "db/models";
import {Op} from "sequelize";

export async function chainFromHeader(req: NextApiRequest, force = false) {
  if (force && !req.headers.chain)
    return null;

  const where = {
    ... !req.headers.chain ? {isDefault: {[Op.eq]: true}} : {chainId: {[Op.eq]: +req.headers.chain}},
  }

  return models.chain.findOne({where});
}