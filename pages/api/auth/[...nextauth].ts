import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import models from '@db/models';
import {Timers} from '@helpers/timers';

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.NEXT_PUBLIC_GH_CLIENT_ID,
      clientSecret: process.env.GH_SECRET,
      authorization: "https://github.com/login/oauth/authorize?scope=read:user+user:email+repo",
      profile(profile: {id, name, login, email, avatar_url}) {
        return {
          id: profile.id,
          name: profile.name,
          login: profile.login,
          email: profile.email,
          image: profile.avatar_url,
        }
      }
    }),
  ],
  callbacks: {
    async signIn({user, account, profile}) {
      // console.log(`User`, user);
      // console.log(`Account`, account);
      // console.log(`Profile`, profile);
      if (!profile?.login)
        return `/?authError=Profile not found`;

      const find = await models.user.findOne({where: {githubLogin: profile.login}, raw: true,})
      const name = profile?.name||profile.login;
      if (!find)
        await models.user.create({
                                   githubHandle: name,
                                   githubLogin: profile.login?.toString(),
                                   accessToken: account?.access_token,
                                 });
      else await models.user.update({accessToken: account?.access_token}, {where: {githubLogin: profile.login?.toString()}});

      setTimeout(async () => {
        const user = await models.user.findOne({where: {githubLogin: profile.login}, raw: true,});
        if (!user.address)
          await models.user.destroy({where: {githubLogin: profile.login?.toString()}});
      }, 60*1000)

      return true;
    },
    async jwt({ token, user, account, profile, isNewUser }) {
      // console.log(`JWT`, token, user, account, profile, isNewUser);
      return {...token, ...profile};
    },
    async session({ session, user, token }) {
      // console.log(`Session`, session, user, token);
      return {expires: session.expires, user: {...session.user, login: token.login}};
    }
  },
});
