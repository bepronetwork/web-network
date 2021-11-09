import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import GithubMicroService from '@services/github-microservice';
import {Octokit} from 'octokit';
import models from '@db/models';
import {Timers} from '@helpers/timers';

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.NEXT_PUBLIC_GH_CLIENT_ID,
      clientSecret: process.env.GH_SECRET,
    }),
  ],
  callbacks: {
    async signIn({user, account, profile}) {
      // console.log(`User`, user);
      // console.log(`Account`, account);
      // console.log(`Profile`, profile);
      if (!user?.name || !profile?.login)
        return `/?authError=Profile not found`;

      const find = await models.user.findOne({where: {githubLogin: profile.githubLogin}, raw: true,})

      if (!find)
        await models.user.create({
                                   githubHandle: user.name,
                                   githubLogin: profile.login?.toString(),
                                   accessToken: account?.access_token,
                                 });
      else await models.user.update({accessToken: account?.access_token}, {where: {githubLogin: profile.login?.toString()}});

      Timers[profile.login?.toString()] = setTimeout(async () => await models.user.destroy({where: {githubLogin: profile.login?.toString()}}), 60*1000)

      return true;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      // console.log(`JWT`, token, user, account, profile, isNewUser);
      return token;
    },
    async session({ session, user, token }) {
      // console.log(`Session`, session, user, token);
      return session;
    }
  },
});
