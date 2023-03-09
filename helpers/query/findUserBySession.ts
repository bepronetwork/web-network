import { NextApiRequest } from "next";
import { getSession } from "next-auth/react";

import models from "db/models";

import {User} from "interfaces/api";

async function findUserBySession(req: NextApiRequest): Promise<User | null> {
  const session = await getSession({ req }) as any;

  if(!session?.user?.login)
    return null

  const user = await models.user.findOne({
      where: { 
        githubLogin: session.user.login
      },
      raw: true
  })

  if(!user)
    return null;

  return user;
}

export default findUserBySession;