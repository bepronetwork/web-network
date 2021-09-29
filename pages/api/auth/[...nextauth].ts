import NextAuth from 'next-auth';
import GithubProvider from 'next-auth/providers/github';
import GithubMicroService from '@services/github-microservice';

export default NextAuth({
  providers: [
    GithubProvider({
      clientId: process.env.NEXT_PUBLIC_GH_CLIENT_ID,
      clientSecret: process.env.GH_SECRET,
    }),
  ],
  callbacks: {
    async signIn({user, account, profile}) {
      if (user.name && profile.login)
        return await GithubMicroService.createGithubData({
          githubHandle: user.name,
          githubLogin: profile.login.toString()
        }).then(result => {
          if (result === true)
            return true;

          console.log(result);

          return `/?authError=${result}`;
        });

      return false
    },
  },
});
