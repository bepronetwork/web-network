import { error as LogError } from "@scripts/logging.js";
import { withCors } from "middleware";
import { NextApiRequest, NextApiResponse } from "next";
import { getToken } from "next-auth/jwt";
import getConfig from "next/config";
import { Octokit } from "octokit";

const { serverRuntimeConfig: { authSecret, github: { token: botToken } } } = getConfig();

async function post(req: NextApiRequest, res: NextApiResponse) {
  const { query, params, useBotToken } = req.body;
  
  const token = useBotToken ? undefined : await getToken({ req, secret: authSecret });

  try {
    const octokit = new Octokit({
      auth: token?.access_token || botToken
    });

    const result = await octokit.graphql(query, params);

    return res.status(200).json(result);
  } catch(error) {
    LogError("GraphQL Proxy", { req, error, token });
    
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