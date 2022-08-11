import NextAuth from "next-auth";
import GithubProvider from "next-auth/providers/github";
import getConfig from "next/config";

const { serverRuntimeConfig } = getConfig();

import models from "db/models";

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: serverRuntimeConfig?.github?.clientId,
      clientSecret: serverRuntimeConfig?.github?.secret,
      authorization:
        "https://github.com/login/oauth/authorize?scope=read:user+user:email+repo",
      profile(profile: { id; name; login; email; avatar_url }) {
        return {
          id: profile.id,
          name: profile.name,
          login: profile.login,
          email: profile.email,
          image: profile.avatar_url,
        };
      },
    }),
  ],
  session:{
    strategy: "jwt",
    maxAge: 24 * 60 * 60 // 1 day
  },
  callbacks: {
    async signIn({ profile }) {
      try {
        if (!profile?.login) return "/?authError=Profile not found";

        return true;
      } catch(e) {
        console.log("SignIn Callback", e);
        return false;
      }
    },
    async jwt({ token, account, profile }) {
      const user = await models.user.findOne({
        where: { 
          githubLogin: profile?.login || token?.login
        },
        raw: true
      })
        .catch(error => {
          console.log("JWT Callback", error)
        });

      return { ...token, ...profile, ...account, wallet: user?.address };
    },
    async session({ session, token }) {
      // console.log(`Session`, session, user, token);
      return {
        expires: session.expires,
        user: {
          ...session.user,
          login: token.login,
          accessToken: token?.access_token,
        },
      };
    },
  },
});
