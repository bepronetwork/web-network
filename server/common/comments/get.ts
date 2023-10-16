import { NextApiRequest, NextApiResponse } from "next";
import { WhereOptions } from "sequelize";

import models from "db/models";

import { isGovernorSigned } from "helpers/handleIsGovernor";

import { error as LogError } from "services/logging";

export default async function get(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { issueId, proposalId, deliverableId, userId, type, id } = req.query;

    const isGovernor = await isGovernorSigned(req.headers);
    
    if (type && !["issue", "deliverable", "proposal", "review"].includes(type?.toString())) {
      return res.status(404).json({ message: "type does not exist" });
    }

    const filters: WhereOptions = {};

    if (!isGovernor) filters.hidden = false;
    if (issueId) filters.issueId = +issueId;
    if (proposalId) filters.proposalId = +proposalId;
    if (deliverableId) filters.deliverableId = +deliverableId;
    if (userId) filters.userId = +userId;
    if (type) filters.type = type;

    let comments;

    const include = [
      {
        association: "user",
        attributes: ["githubLogin"]
      }
    ]

    if ((issueId || proposalId || deliverableId || userId || type) && !id) {
      /* When we only ask for deliverableId || proposalId || issueid, 
      this route fetches all comments related to that id, regardless of type */
      comments = await models.comments.findAll({
        where: {
          ...filters,
        },
        include
      });
    } else {
      comments = await models.comments.findOne({
        where: {
          id: +id,
          ...filters,
        },
        include
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
