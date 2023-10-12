import {NextApiRequest} from "next";
import {Op} from "sequelize";

import models from "db/models";
import Issue from "db/models/issue.model";

import {chainFromHeader} from "helpers/chain-from-header";
import {lowerCaseIncludes} from "helpers/string";
import {isValidUrl} from "helpers/validateUrl";

import {add} from "services/ipfs-service";

import {ErrorMessages} from "server/errors/error-messages";
import {HttpBadRequestError, HttpUnauthorizedError} from "server/errors/http-errors";

export async function post(req: NextApiRequest): Promise<Issue> {
  const {
    title,
    body,
    deliverableType,
    origin,
    networkName,
    tags,
    tierList,
    isKyc,
    amount,
    context
  } = req.body;

  const chain = await chainFromHeader(req);

  if (!chain)
    throw new HttpBadRequestError("Chain not provided");

  const network = await models.network.findOne({
    where: {
      name: {
        [Op.iLike]: String(networkName).replaceAll(" ", "-")
      },
      chain_id: { [Op.eq]: +chain.chainId }
    }
  });

  if (!network || network?.isClosed)
    throw new HttpBadRequestError("Invalid network");

  if (origin && !isValidUrl(origin))
    throw new HttpBadRequestError("Invalid origin provided");

  const isOriginBanned = origin ? 
    network.banned_domains.some(banned => lowerCaseIncludes(origin, banned)) : false;

  if (isOriginBanned)
    throw new HttpBadRequestError("Banned origin provided");

  const userCanCreateBounty =
    !network.allow_list?.length || lowerCaseIncludes(req.headers.wallet as string, network.allow_list);

  if (!userCanCreateBounty)
    throw new HttpBadRequestError(ErrorMessages.CreateBountyNotAllowList);

  const user = await models.user.findByAddress(context.token.address);

  if (!user)
    throw new HttpUnauthorizedError("Invalid user");

  const issue = {
    type: deliverableType,
    origin,
    amount,
    state: "pending",
    title,
    body: body,
    network_id: network.id,
    tags,
    chain_id: +chain.chainId,
    isKyc: !!isKyc,
    kycTierList: tierList?.map(Number).filter(id=> !Number.isNaN(id)) || [],
    userId: user.id
  };

  const bountyJson = {
    name: issue.title,
    properties: {
      type: deliverableType,
      origin: origin,
      chainId: issue.chain_id,
      network: {
        name: network.name,
        address: network.networkAddress,
      },
      price: issue.amount,
      tags: issue.tags,
      kycNeeded: issue.isKyc
    }
  };

  const { hash } = await add(bountyJson, true);

  const savedIssue = await models.issue.create({
    ...issue,
    ipfsUrl: hash
  });

  return savedIssue;
}