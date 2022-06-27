import { withCors } from "middleware";
import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";
import getConfig from "next/config";
import { Octokit } from "octokit";

import { CustomSession } from "interfaces/custom-session";

const { serverRuntimeConfig: { github: { token: botToken } } } = getConfig();

async function post(req: NextApiRequest, res: NextApiResponse) {
  try {
    const { query, params } = req.body;

    const session = await getSession({ req }) as CustomSession;

    const octokit = new Octokit({
      auth: session?.user?.accessToken || botToken
    });

    const result = await octokit.graphql(query, params);

    return res.status(200).json(result);
  } catch(error) {
    error("", { req, error });
    return res.status(500).json(error);
  }
}

async function handler(req: NextApiRequest, res: NextApiResponse) {
  switch (req.method) {
  case "POST":
    return post(req, res);
  default:
    return res.status(405).json({ statusCode: 405, message: "Method Not Allowed" });
  }
}

export default withCors(handler);