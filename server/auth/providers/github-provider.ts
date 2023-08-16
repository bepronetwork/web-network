
import { NextApiRequest } from "next";
import { JWT } from "next-auth/jwt";
import GithubProvider from "next-auth/providers/github";
import getConfig from "next/config";

import models from "db/models";

import { AuthProvider } from "server/auth/providers";

const { serverRuntimeConfig } = getConfig();
interface Profile {
  id: number;
  name: string;
  login: string;
  email: string;
  image?: string;
  avatar_url: string;
}

export const GHProvider = (currentToken: JWT, req: NextApiRequest): AuthProvider => ({
  config: GithubProvider({
    clientId: serverRuntimeConfig?.github?.clientId,
    clientSecret: serverRuntimeConfig?.github?.secret,
    authorization:
      "https://github.com/login/oauth/authorize?scope=read:user+user:email+repo",
    profile(profile) {
      return {
        id: profile.id,
        name: profile.name,
        login: profile.login,
        email: profile.email,
        image: profile.avatar_url,
      };
    },
  }),
  callbacks: {
    async signIn({ profile }) {
      const { login } = (profile || {}) as Profile;

      if (!login) return "/?authError=Profile not found";

      const callbackUrlHttpKey = "next-auth.callback-url";
      const callbackUrlHttpsKey = "__Secure-next-auth.callback-url";

      const isConnectAccountsPage = req?.cookies ?
        (req.cookies[callbackUrlHttpKey] || req.cookies[callbackUrlHttpsKey])?.includes("connect-account") : false;

      const user = await models.user.findByGithubLogin(login);

      if (!user && !isConnectAccountsPage)
        return "/connect-account";

      return true;
    },
    async jwt({ profile, account, token }) {
      const { name, login } = (profile || {}) as Profile;
      const { provider, access_token } = account;

      return {
        ...token,
        ...currentToken,
        name,
        login,
        provider,
        accessToken: access_token
      };
    },
  }
});