import { NextApiRequest, NextApiResponse } from "next";
import { WhereOptions } from "sequelize";

import models from "db/models";

import { isGovernorSigned } from "helpers/handleIsGovernor";

import { error as LogError } from "services/logging";

export default async function get(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { issueId, proposalId, deliverableId, userId, id } = req.query;

    const isGovernor = await isGovernorSigned(req.headers);

    const filters: WhereOptions = {};

    if (!isGovernor) filters.hidden = false;
    if (issueId) filters.issueId = +issueId;
    if (proposalId) filters.proposalId = +proposalId;
    if (deliverableId) filters.deliverableId = +deliverableId;
    if (userId) filters.userId = +userId;

    let comments;

    if ((issueId || proposalId || deliverableId || userId) && !id) {
      comments = await models.comments.findAll({
        where: {
          ...filters,
        },
      });
    } else {
      comments = await models.comments.findOne({
        where: {
          id: +id,
          ...filters,
        },
      });
    }

    if (!comments)
      return res.status(404).json({ message: "comments not found" });

    return res.status(200).json(comments);
  } catch (error) {
    LogError(error);
    res.status(500).json(error);
  }
}
