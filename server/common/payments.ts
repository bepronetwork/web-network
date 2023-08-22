import { endOfDay, isAfter, parseISO, startOfDay } from "date-fns";
import { ParsedUrlQuery } from "querystring";
import { Op, WhereOptions } from "sequelize";


import models from "db/models";

import { caseInsensitiveEqual } from "helpers/db/conditionals";

import { HttpBadRequestError } from "server/errors/http-errors";

export default async function get(query: ParsedUrlQuery) {
  const {
    wallet,
    startDate,
    endDate,
    networkName,
    networkChain,
    groupBy,
  } = query;

  if (!wallet)
    throw new HttpBadRequestError("Missing parameters: wallet");

  const networkWhere: WhereOptions = networkName ? {
    name: caseInsensitiveEqual("issue.network.name", networkName.toString())
  } : {};

  const chainWhere: WhereOptions = networkChain ? {
    chainShortName: caseInsensitiveEqual("issue.network.chain.chainShortName", networkChain.toString())
  } : {};

  const timeFilter: WhereOptions = {};

  if (startDate && endDate) {
    const initialDate = parseISO(startDate.toString())
    const finalDate = parseISO(endDate.toString())
  
    if (isAfter(initialDate, finalDate))
      throw new HttpBadRequestError("Invalid time interval");

    timeFilter.createdAt = {
      [Op.between]: [startOfDay(initialDate), endOfDay(finalDate)]
    };
  } else if (endDate) {
    timeFilter.createdAt = {
      [Op.lte]: parseISO(endDate?.toString())
    };
  }

  const payments = await models.userPayments.findAll({
    include: [
      {
        association: "issue",
        attributes: ["id", "issueId", "title", "amount", "fundingAmount", "rewardAmount"],
        required: true,
        include: [
          { 
            association: "transactionalToken",
            attributes: ["address", "name", "symbol"]
          },
          {
            association: "network",
            attributes: ["id", "name", "colors", "logoIcon", "fullLogo", "networkAddress"],
            required: !!networkName || !!networkChain,
            where: networkWhere,
            include: [
              { 
                association: "chain",
                attributes: ["chainShortName"],
                required: !!networkChain,
                where: chainWhere
              }
            ],
          },
        ],
      },
    ],
    where: {
      address: {
        [Op.iLike]: wallet
      },
      transactionHash: {
        [Op.not]: null
      },
      ...timeFilter
    }
  });

  if (payments.length && groupBy === "network") {
    return payments
      .map(p => p.get({ plain: true }))
      .reduce((acc, cur) => {
        const curNetworkIndex = acc.findIndex(n => n.id === cur.issue.network.id);
        
        const newAcc = [...acc];
        const withoutNetwork = {
          ...cur,
          issue: {
            ...cur.issue,
            network: undefined,
          }
        };
        
        if (curNetworkIndex > -1)
          newAcc[curNetworkIndex].payments.push(withoutNetwork);
        else
          newAcc.push({ ...cur.issue.network, payments: [withoutNetwork] });
          
        return newAcc;
      }, []);
  }

  return payments;
}