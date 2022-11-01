## 1. NEXTAUTH

The authentication in the project is composed by two parts;  A Metamask Wallet and a [Github Provider](https://next-auth.js.org/providers/github) using [NextAuth](next-auth.js.org).

NextAuth requires a environment key to be able to use JWT, so to generate the key, run:

```console
$ openssl rand -base64 32
```

Then fill in the value into .env file;

```text
# .env

NEXTAUTH_SECRET=yourKey
NEXTAUTH_URL=http://localhost:3000 or yourDomain.
```

## 2. GITHUB OAUTH

A Github [Github OAuthApp](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app) is needed to complete the authentication flow; its callback url must be `[yourdomain]/api/auth/callback/github`.

Update the environment variables with the client id and secret;

```text
# .env

## GitHub
# Create a github OAuthApp and add information here
NEXT_GH_CLIENT_ID=
NEXT_GH_SECRET=
```