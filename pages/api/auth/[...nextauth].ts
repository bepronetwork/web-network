import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import GithubMicroService from '@services/github-microservice';

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.NEXT_PUBLIC_GH_CLIENT_ID,
      clientSecret: process.env.GH_SECRET,
      scope: `read:user`,
    }),
  ],
  callbacks: {
    signIn(user, account, profile: { login: string }) {
      console.log(user);
      if(user.name && profile.login){
        return GithubMicroService.createGithubData({
          githubHandle: user.name,
          githubLogin: profile.login
        })
        .then(() => `/connect-account`)
        .catch(() => false)
      }

      return false
    },
  },
});
