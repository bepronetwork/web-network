import NextAuth from 'next-auth';
import Providers from 'next-auth/providers';
import GithubMicroService from '@services/github-microservice';
import { BeproService } from '@services/bepro-service';

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.NEXT_PUBLIC_GH_CLIENT_ID,
      clientSecret: process.env.GH_SECRET,
      scope: ``,
    }),
  ],
  callbacks: {
    signIn(user, account, profile: { login: string }) {
      if(user.name && profile.login){
        return GithubMicroService.createGithubData({
          githubHandle: user.name,
          githubLogin: profile.login
        })
        .then(() => true)
        .catch(() => false)
      }

      return false
    },
  },
});
