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
      // console.log(`User`, user);
      // console.log(`Account`, account);
      // console.log(`Profile`, profile);

      if (user.name && profile.login)
        return await GithubMicroService.createGithubData({
          githubHandle: user.name,
          githubLogin: profile.login?.toString(),
          accessToken: account?.access_token,
        }).then(result => {
          if (result === true)
            return true;

          console.error(`Error logging in`, result);

          return `/?authError=${result}`;
        });

      return false
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
