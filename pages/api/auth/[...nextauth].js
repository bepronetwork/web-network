import NextAuth from 'next-auth'
import Providers from 'next-auth/providers'
import GithubMicroService from "../../../services/github-microservice";
import BeproService from "../../../services/bepro";

export default NextAuth({
  providers: [
    Providers.GitHub({
      clientId: process.env.NEXT_PUBLIC_GH_CLIENT_ID,
      clientSecret: process.env.GH_SECRET,
      scope: `read:user`,
    }),
  ],
  callbacks: {
    signIn(user, account, profile) {
      if (BeproService.address)
        return GithubMicroService.joinAddressToHandle({githubHandle: user.name, address: BeproService.address});

      return !!user?.email;
    }
  }
})
