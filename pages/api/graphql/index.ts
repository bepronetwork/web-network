import { withCors } from "middleware";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import getConfig from "next/config";
import { Octokit } from "octokit";

import { error as LogError } from "helpers/api/handle-log";

const { serverRuntimeConfig: { authSecret, github: { token: botToken } } } = getConfig();

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { query, params } = req.body;
  const { access_token, login, name } = await getToken({ req, secret: authSecret });

  try {
    const octokit = new Octokit({
      auth: access_token || botToken
    });

    const result = await octokit.graphql(query, params);

    return res.status(200).json(result);
  } catch(error) {
    LogError("", { req, error, access_token, login, name });
    
    return res.status(200).json(error.data);
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
  case "POST":
    await post(req, res);
    break;
  default:
    return res.status(405).json({ statusCode: 405, message: "Method Not Allowed" });
  }
}

export default withCors(handler);