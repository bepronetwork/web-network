import {isZeroAddress} from "ethereumjs-util";
import {NextApiRequest, NextApiResponse} from "next";
import {Op} from "sequelize";
import {isAddress} from "web3-utils";

import models from "db/models";

import {WRONG_PARAM_ADDRESS, WRONG_PARAM_URL} from "helpers/constants";
import {resJsonMessage} from "helpers/res-json-message";

import {MiniChainInfo} from "interfaces/mini-chain";

import {AdminRoute} from "middleware";

import {error} from "services/logging";

async function Post(req: NextApiRequest, res: NextApiResponse) {
  const body = req.body as MiniChainInfo & { isDefault: boolean; };

  const missingValues = [
    [body.chainId, 'no chain id'],
    [body.name, 'missing name'],
    [body.shortName, 'missing currency short name'],
    [body.activeRPC, 'missing active rpc'],
    [body.nativeCurrency?.name, 'missing currency name'],
    [body.nativeCurrency?.symbol, 'missing currency symbol'],
    [body.nativeCurrency?.decimals, 'missing currency decimals'],
    [body.eventsApi, 'missing events api'],
    [body.explorer, 'missing explorer'],
  ].filter(([value]) => !value).map(([,error]) => error);

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
    isDefault: body.isDefault,
    blockScanner: body.explorer,
    eventsApi: body.eventsApi,
    color: body.color,
    icon: body.icon
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

async function Patch(req: NextApiRequest, res: NextApiResponse) {
  if (!req.body.chainId)
    return res.status(400).json({message: 'missing chain id'});

  const isUrl = (url) => { try { return (new URL(url))?.protocol?.search(/https?:/) > -1 } catch { return false } }
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

  if (req.body.registryAddress) {
    if (!isAddress(req.body.registryAddress) || isZeroAddress(req.body.registryAddress))
      return resJsonMessage(WRONG_PARAM_ADDRESS`registryAddress`, res, 400);

    chain.registryAddress = req.body.registryAddress;
  }

  if (req.body.eventsApi) {
    if (!isUrl(req.body.eventsApi))
      return resJsonMessage(WRONG_PARAM_URL`eventsApi`, res, 400);

    chain.eventsApi = req.body.eventsApi;
  }

  if (req.body.explorer) {
    if (!isUrl(req.body.explorer))
      return resJsonMessage(WRONG_PARAM_URL`explorer`, res, 400);

    chain.blockScanner = req.body.explorer;
  }

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
     ... query.chainId ? {chainId: {[Op.eq]: query.chainId}} : {},
     ... query.name ? {chainName: {[Op.iLike]: query.name}} : {},
     ... query.shortName ? {chainShortName: {[Op.iLike]: query.shortName}} : {},
     ... query.chainRpc ? {chainRpc: {[Op.iLike]: query.chainRpc}} : {},
     ... query.nativeCurrencyName ? {chainCurrencyName: {[Op.iLike]: query.nativeCurrencyName}} : {},
     ... query.nativeCurrencySymbol ? {chainCurrencySymbol: {[Op.iLike]: query.nativeCurrencySymbol}} : {},
     ... query.nativeCurrencyDecimals ? {chainCurrencyDecimals: {[Op.eq]: query.nativeCurrencyDecimals}} : {}
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
  switch (req.method.toLowerCase()) {
  case "post":
    await Post(req, res);
    break;

  case "patch":
    await Patch(req, res)
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

export default AdminRoute(ChainMethods);