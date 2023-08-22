import { NextApiRequest, NextApiResponse } from "next";
import { Sequelize, WhereOptions } from "sequelize";

import models from "db/models";

import { error as LogError } from "services/logging";

export default async function post(req: NextApiRequest, res: NextApiResponse) {
  try {
    const headerWallet = (req.headers.wallet as string).toLowerCase();

    const {
      comment,
      issueId,
      deliverableId,
      proposalId,
      type: originalType,
      replyId,
    } = req.body;

    const type = originalType.toLowerCase();

    const isValidNumber = (v) => /^\d+$/.test(v);

    const foundOrValid = (v) => v ? 'found' : 'valid'

    if (!["issue", "deliverable", "proposal", "review"].includes(type)) {
      return res.status(404).json({ message: "type does not exist" });
    }

    if (!issueId || !isValidNumber(issueId))
      return res
        .status(404)
        .json({ message: `issueId not ${foundOrValid(!issueId)}` });

    if ((["deliverable", "review"].includes(type)) && (!deliverableId || !isValidNumber(deliverableId)))
      return res.status(404).json({ message: `deliverableId not ${foundOrValid(!deliverableId)}` });

    if (type === "proposal" && (!proposalId || !isValidNumber(proposalId)))
      return res.status(404).json({ message: `proposalId not ${foundOrValid(!proposalId)}` });

    const user = await models.user.findOne({
      where: {
        address: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("address")),
                                 "=",
                                 headerWallet),
      },
    });

    if (!user) return res.status(404).json({ message: "user not found" });

    const whereCondition: WhereOptions = {};

    if (deliverableId && ["deliverable", "review"].includes(type))
      whereCondition.deliverableId = +deliverableId;
    if (proposalId && type === "proposal")
      whereCondition.proposalId = +proposalId;

    const comments = await models.comments.create({
      issueId: +issueId,
      comment,
      type,
      userAddress: headerWallet,
      userId: user.id,
      hidden: false,
      ...(deliverableId || proposalId ? whereCondition : null),
      ...(replyId ? { replyId: +replyId } : null),
    });

    if(type === 'review' && comments){
      const deliverable = await models.pullRequest.findOne({
        where: {
          id: +deliverableId
        }
      })

      if (!deliverable.reviewers.find((el) => +el === user.id)) {
        deliverable.reviewers = [...deliverable.reviewers, user.id];
  
        await deliverable.save();
      }
    }

    return res.status(200).json(comments);
  } catch (error) {
    res.status(500).json(error);
    LogError(error)
  }
}
