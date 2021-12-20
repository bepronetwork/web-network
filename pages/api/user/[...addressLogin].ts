import { NextApiRequest, NextApiResponse } from "next";
import models from "@db/models";
import { BeproService } from "@services/bepro-service";
import {CONTRACT_ADDRESS, SETTLER_ADDRESS, TRANSACTION_ADDRESS, WEB3_CONNECTION} from '../../../env';
import { Network } from "bepro-js";


async function start() {
  try {

    console.log(`Starting Network Service...`);

   const NetworkT = new Network({
      contractAddress: CONTRACT_ADDRESS,
      test: true,
      opt: {
        web3Connection: WEB3_CONNECTION
      },
    });

    return await NetworkT.start();

  } catch (e) {
    console.log(`Problem starting...`, e);
    return false;
  }
}

async function remove(req: NextApiRequest, res: NextApiResponse) {
  const {
    addressLogin: [address, githubLogin],
  } = req.query;
  console.log('network', CONTRACT_ADDRESS, WEB3_CONNECTION)
  const NetworkT = new Network({
    contractAddress: CONTRACT_ADDRESS,
    test: true,
    localtest: true,
    opt: {
      web3Connection: WEB3_CONNECTION
    },
  });

  console.log('beproTest', await NetworkT.start())
  await NetworkT.getOraclesSummary({address: address}).then(test => console.log('sumaary', test)).catch(err => console.log('error', err))
  /*await BeproService.start().then(res => console.log('res start', res)).catch((err) => console.log('err start', err))
  await BeproService.login(true).then(res => console.log('res', res)).catch((err) => console.log('err login', err))
  console.log('contract', BeproService.network.params.contract)
  await beproTest
    .getOraclesSummary({ address: address })
    .then((oracles) => console.log("oracles", oracles))
    .catch((e) => {
      console.log("err", e);
    });*/

    
  return res.status(200).json("ok");
  let user = await models.user.findOne({
    where: {
      address: address.toString().toLowerCase(),
      githubLogin: githubLogin,
    },
  });

  if (!user) return res.status(404).json(`address not found`);

  const deleted = await user.destroy();

  res
    .status(!deleted ? 422 : 200)
    .json(!deleted ? `Couldn't delete entry ${address}` : `ok`);
}

export default async function User(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
    case "delete":
      await remove(req, res);
      break;

    default:
      res.status(405);
  }

  res.end();
}
