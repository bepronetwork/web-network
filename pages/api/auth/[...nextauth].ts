import { NextApiRequest, NextApiResponse } from "next";
import NextAuth from "next-auth";
import { getToken } from "next-auth/jwt";
import getConfig from "next/config";

import models from "db/models";

import { Logger } from "services/logging";

import { SESSION_TTL } from "server/auth/config";
import { EthereumProvider, GHProvider } from "server/auth/providers";
import { AccountValidator } from "server/auth/validators/account";

const {
  serverRuntimeConfig: {
    auth: {
      secret
    }
  }
} = getConfig();

export default async function auth(req: NextApiRequest, res: NextApiResponse) {
  const currentToken = await getToken({ req, secret: secret });

  const ethereumProvider = EthereumProvider(currentToken, req);
  const githubProvider = GHProvider(currentToken, req);

  return NextAuth(req, res, {
    providers: [
      ethereumProvider.config,
      githubProvider.config
    ],
    pages: {
      signIn: "/auth/signin"
    },
    session:{
      strategy: "jwt",
      maxAge: SESSION_TTL
    },
    callbacks: {
      async signIn(params) {
        try {
          const provider = params?.account?.provider;

          switch (provider) {
          case "github":
            return githubProvider.callbacks.signIn(params);
          
          case "credentials":
            return ethereumProvider.callbacks.signIn(params);
          
          default:
            return false;
          }
        } catch(error) {
          Logger.error(error, "SignIn callback: ");
        }

        return false;
      },
      async jwt(params) {
        try {
          const provider = params?.account?.provider;

          switch (provider) {
          case "github":
            return githubProvider.callbacks.jwt(params);
          
          case "credentials":
            return ethereumProvider.callbacks.jwt(params);
          
          default:
            return params.token;
          }
        } catch(error) {
          Logger.error(error, "JWT callback: ");
        }

        return params?.token;
      },
      async session({ session, token }) {
        const { login, roles, address, nonce } = token;

        const accountsMatch = await AccountValidator.matchAddressAndGithub(address?.toString(), login?.toString());
        const user = await models.user.scope("ownerOrGovernor").findByAddress(address);

        return {
          expires: session.expires,
          user: {
            id: user.id,
            login: user.githubLogin,
            roles,
            address,
            accountsMatch,
            nonce,
            email: user.email,
            isEmailConfirmed: user.isEmailConfirmed,
            emailVerificationSentAt: user.emailVerificationSentAt,
          },
        };
      },
    },
  });
}
