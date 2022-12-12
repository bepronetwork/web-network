import {NextApiRequest, NextApiResponse} from "next";
import {MiniChainInfo} from "../../../interfaces/mini-chain";
import {Op} from "sequelize";

import models from "db/models";
import {error} from "../../../services/logging";
import {withCors} from "../../../middleware";
import getConfig from "next/config";

async function Post(req: NextApiRequest, res: NextApiResponse, isAdmin = false) {

  if (!isAdmin)
    return res.status(401).json({message: 'nope.'});

  const body = req.body as MiniChainInfo;

  const missingValues = [
    [body.chainId, 'no chain id'],
    [body.name, 'missing name'],
    [body.shortName, 'missing currency short name'],
    [body.activeRPC, 'missing active rpc'],
    [body.nativeCurrency?.name, 'missing currency name'],
    [body.nativeCurrency?.symbol, 'missing currency symbol'],
    [body.nativeCurrency?.decimals, 'missing currency decimals'],
  ].filter(([value]) => !value).map(([,error]) => error);


  const {publicRuntimeConfig} = getConfig();
  const {wallet} = req.headers;
  if ((wallet as string)?.toLowerCase() !== publicRuntimeConfig.adminWallet.toLowerCase())
    return res.status(401).json({message: 'nope.'});

  if (missingValues.length)
    return res.status(400).json({message: missingValues});


  const model = {
    chainId: body.chainId,
    chainRpc: body.activeRPC,
    chainName: body.name,
    chainShortName: body.shortName,
    chainCurrencySymbol: body.nativeCurrency?.symbol,
    chainCurrencyName: body.nativeCurrency?.name,
    chainCurrencyDecimals: body.nativeCurrency?.decimals,
    isDefault: (body as any).isDefault,
    registryAddress: (body as any).networkRegistry,
  }

  const chain = await models.chain.findOne({where: {chainId: {[Op.eq]: model.chainId}}});

  if (!chain) {
    const all = await models.chain.findAll();
    model.isDefault = !all.length;
  } else if (chain)
    return res.status(400)
      .json({message: `Chain already exists`});

  const logError = (e) => {
    error(`Failed to create ${model.chainId}`, e);
    return false;
  }

  const action = await models.chain.create(model).then(() => true).catch(logError);

  return res.status(action ? 200 : 400)
    .json({message: action ? 'ok' : `Failed to create ${model.chainId}`});
}

async function Patch(req: NextApiRequest, res: NextApiResponse, isAdmin = false) {

  if (!isAdmin)
    return res.status(401).json({message: 'nope.'});

  if (!req.body.chainId)
    return res.status(400).json({message: 'missing chain id'});

  const where = {where: {chainId: {[Op.eq]: req.body.chainId}}};

  const chain = await models.chain.findOne(where);
  if (!chain)
    return res.status(404).json({message: 'not found'});

  if (req.body.isDefault !== undefined) {
    if ((!!chain.isDefault !== req.body.isDefault))
      return res.status(400).json({message: "can't change isDefault from self"})

    if (req.body.isDefault) {
      const defaultChain = await models.chain.findOne({where: {isDefault: {[Op.eq]: true}}});
      if (defaultChain) {
        defaultChain.isDefault = false;
        await defaultChain.save();
      }
    }

    chain.isDefault = req.body.isDefault;
  }

  if (chain.registryAddress)
    chain.registryAddress = req.body.registryAddress;

  await chain.save();

  return res.status(200).json(chain);
}

async function Remove(req: NextApiRequest, res: NextApiResponse) {
  if (!req.query?.id)
    return res.status(400).json({message: 'missing id'});

  const found = await models.chain.findOne({where: {chainId: req.query.id}})

  if (!found)
    return res.status(404).json({message: 'not found'});

  found.destroy();

  return res.status(200).json({message: 'ok'});

}

async function Get(req: NextApiRequest, res: NextApiResponse) {

  const query = req.query;
  const where = {
     ... query.chainId ? {chainId: {[Op.iLike]: query.chainId}} : {},
     ... query.name ? {chainId: {[Op.iLike]: query.name}} : {},
     ... query.shortName ? {chainId: {[Op.iLike]: query.shortName}} : {},
     ... query.activeRPC ? {chainId: {[Op.iLike]: query.activeRPC}} : {},
     ... query.nativeCurrencyName ? {chainId: {[Op.iLike]: query.nativeCurrencyName}} : {},
     ... query.nativeCurrencySymbol ? {chainId: {[Op.iLike]: query.nativeCurrencySymbol}} : {},
     ... query.nativeCurrencyDecimals ? {chainId: {[Op.iLike]: query.nativeCurrencyDecimals}} : {},
  }

  return models.chain.findAll({where})
    .then(r => ({result: r}))
    .catch(e => {
      error(`Failed to get chains`, {query, message: e?.message,});
      return {result: [], error: e?.message}
    })
    .then(({result, error}) => res.status(!error ? 200 : 400).json({result, error}));
}

async function ChainMethods(req: NextApiRequest, res: NextApiResponse) {

  console.log(`ChainMethods`)

  const {publicRuntimeConfig} = getConfig();
  const {wallet} = req.headers;

  const isAdmin = wallet && (wallet as string).toLowerCase() === publicRuntimeConfig?.adminWallet?.toLowerCase();

  switch (req.method.toLowerCase()) {
    case "post":
      await Post(req, res, isAdmin);
      break;

    case "patch":
      await Patch(req, res, isAdmin)
      break;

    case "delete":
      await Remove(req, res);
      break;

    case "get":
      await Get(req, res);
      break;

    default:
      return res.status(405).json({message: "Method not allowed"});
  }

  res.end();
}

export default withCors(ChainMethods)