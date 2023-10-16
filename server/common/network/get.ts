import { NextApiRequest } from "next";
import { Op, Sequelize } from "sequelize";

import Database from "db/models";
import Network from "db/models/network.model";

import { chainFromHeader } from "helpers/chain-from-header";

import { HttpNotFoundError } from "server/errors/http-errors";

export async function get(req: NextApiRequest): Promise<Network> {
  const { name: networkName, creator: creatorAddress, isDefault, address, byChainId, chainName } = req.query;

  const chain = await chainFromHeader(req);

  const isTrue = (value: string) => value === "true";

  const where = {
    ... isTrue(byChainId?.toString()) && chain ? { chain_id: { [Op.eq]: +chain?.chainId } } : {},
    ... networkName && {
      name: {
        [Op.iLike]: String(networkName)
      }
    } || {},
    ... creatorAddress && {
      creatorAddress: {
        [Op.iLike]: String(creatorAddress)
      }
    } || {},
    ... isDefault && {
      isDefault: isTrue(isDefault.toString())
    } || {},
    ... address && {
      networkAddress: { [Op.iLike]: String(address) },
    } || {}
  };

  const network = await Database.network.findOne({
    attributes: { exclude: ["creatorAddress", "updatedAt"] },
    include: [
      { association: "tokens" },
      { association: "curators" },
      { association: "networkToken" },
      { 
        association: "chain",
        ... chainName ? {
          where: {
            chainShortName: Sequelize.where(Sequelize.fn("LOWER", Sequelize.col("chain.chainShortName")), 
                                            "=",
                                            chainName.toString().toLowerCase())
          }
        } : {},
        required: !!chainName
      },
    ],
    where
  });
  
  if (!network)
    throw new HttpNotFoundError("Network not found");

  return network;
}