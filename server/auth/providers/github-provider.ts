
import { NextApiRequest } from "next";
import { JWT } from "next-auth/jwt";
import GithubProvider from "next-auth/providers/github";
import getConfig from "next/config";

import models from "db/models";

import { caseInsensitiveEqual } from "helpers/db/conditionals";

import { AuthProvider } from "server/auth/providers";

const { serverRuntimeConfig } = getConfig();
interface Profile {
  id: number;
  login: string;
  image?: string;
  avatar_url: string;
}

interface Token extends JWT {
  address: string;
}

export const GHProvider = (currentToken: JWT, req: NextApiRequest): AuthProvider => ({
  config: GithubProvider({
    clientId: serverRuntimeConfig?.github?.clientId,
    clientSecret: serverRuntimeConfig?.github?.secret,
    authorization: {
      url: "https://github.com/login/oauth/authorize",
      params: { scope: "read:user" },
    },
    profile(profile) {
      return {
        id: profile.id,
        name: profile.name,
        login: profile.login,
        image: profile.avatar_url,
      };
    },
  }),
  callbacks: {
    async signIn({ profile }) {
      const { login } = (profile || {}) as Profile;
      const { address } = currentToken as Token;

      if (!login || !address) return "/?authError=Profile not found";

      const callbackUrlHttpKey = "next-auth.callback-url";
      const callbackUrlHttpsKey = "__Secure-next-auth.callback-url";

      const isGithubLoginExist = await models.user.findByGithubLogin(login);

      const currentUser = await models.user.findOne({
        where: {
          address: caseInsensitiveEqual("address", address.toLowerCase())
        }
      });

      if(isGithubLoginExist){
        const originalUrl = (req.cookies[callbackUrlHttpKey] || req.cookies[callbackUrlHttpsKey])
        const queryError = "?isGithubLoginExist=true"
        const verifyAlreadyExistsError = originalUrl.includes(queryError)
        return `${verifyAlreadyExistsError ? originalUrl : originalUrl+queryError}`
      }
        

      if(currentUser && !isGithubLoginExist) {
        currentUser.githubLogin = login;
        await currentUser.save()
      }

      return true;
    },
    async jwt({ profile, account }) {
      const { login } = (profile || {}) as Profile;
      const { provider } = account;

      return {
        ...currentToken,
        login,
        provider
      };
    },
  }
});