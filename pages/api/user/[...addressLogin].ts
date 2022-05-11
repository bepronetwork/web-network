import { NextApiRequest, NextApiResponse } from "next";
import models from "@db/models";
import networkBeproJs from "@helpers/api/handle-network-bepro";

async function remove(req: NextApiRequest, res: NextApiResponse) {
  const {
    addressLogin: [address, githubLogin],
  } = req.query;

  let user = await models.user.findOne({
    where: {
      address: address.toString().toLowerCase(),
      githubLogin: githubLogin,
    },
  });

  if (user) {
    const network = networkBeproJs({ test: true });
    await network.start();
    const contract = network.params.contract.getContract();
    const beproLocked = await contract.methods
      .getOraclesByAddress(address)
      .call();

    if (beproLocked > 0)
      return res.status(409).json({ message: "User contains locked $Bepros" });
  }

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
