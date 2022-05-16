import axios from "axios";
import withCors from 'middleware/withCors';
import { NextApiRequest, NextApiResponse } from "next";
import getConfig from "next/config";

const { serverRuntimeConfig } = getConfig();

async function get(req: NextApiRequest, res: NextApiResponse) {
  const key = serverRuntimeConfig?.ipApi?.key;
  if (serverRuntimeConfig?.ipApi?.skip)
    return res.status(200).json({ countryCode: "PT" });

  console.log({
    ...req.headers,
    "cf-connecting-ip": req.headers["cf-connecting-ip"],
    "cf-connecting-ipv6": req.headers["cf-connecting-ipv6"],
    "x-forwarded-for": req.headers["x-forwarded-for"],
    "remote-address": req.connection?.remoteAddress
  });

  const ip = req.headers["cf-connecting-ip"] || req.connection?.remoteAddress;

  const response = await axios
    .get(`https://pro.ip-api.com/json/${ip}?key=${key}&fields=status,message,countryCode,country`)
    .catch((error) => {
      return error.response;
    });

  return res.status(response.status).json(response.data);
}

async function GetIp(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "get":
    await get(req, res);
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}

export default withCors(GetIp)