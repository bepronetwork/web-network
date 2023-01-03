import { NextApiRequest, NextApiResponse } from "next";
import { getSession } from "next-auth/react";

import models from "db/models";

import {User} from "interfaces/api";

async function findUserBySession(req: NextApiRequest, res: NextApiResponse): Promise<User | void> {
  const session = await getSession({ req }) as any;

  if(!session?.user?.login)
    return res.status(400).json('User Session not found')

  const user = await models.user.findOne({
      where: { 
        githubLogin: session.user.login
      },
      raw: true
  })

  if(!user)
    return res.status(400).json('User not found')

  return user;
}

export default findUserBySession;