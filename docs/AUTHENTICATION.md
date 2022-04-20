## 1. NEXTAUTH

The authentication in the project is composed by two parts;  A metamask wallet and a [Github Provider](https://next-auth.js.org/providers/github) with [NextAuth](next-auth.js.org).

NextAuth required a environment key to be able to use JWT, create it with;

generate key;

```console
$ openssl rand -base64 32
```

Use the value to update the .env file with it;

```text
# .env

NEXTAUTH_URL=yourDomain
NEXTAUTH_SECRET=yourKey
```

## 2. GITHUB OAUTH

A Github [Github OAuthApp](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app) is needed to complete the authentication flow; its callback url must be `[yourdomain]/api/auth/callback/github`.

Update the environment variables with the client id and secret;

```text
# .env

NEXT_GH_CLIENT_ID=yourOAuthClientId
NEXT_GH_SECRET=yourOAuthSecret
```