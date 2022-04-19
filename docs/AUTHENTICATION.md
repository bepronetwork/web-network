## 1. NEXTAUTH

The authentication in project is compose in two parts, first by metamask wallet, and second by [Github Provider](https://next-auth.js.org/providers/github) with [NextAuth](next-auth.js.org).

Your need generate a new key for the NextAuth enable JWT and set how domain will able make login.

generate key
```console
$ openssl rand -base64 32
```

and set the in

```text
# .env
NEXTAUTH_URL=yourDomain
NEXTAUTH_SECRET=yourKey
```

## 2. GITHUB OAUTH

As mentioned in the previous topic, Github its second steps in authentication flow, and to this work, is required configurate a new [Github OAuthApp](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app) pointing out `Authorization callback URL` to end point `/api/auth/callback/github`.

if you never have use Github OAuth App before, follow this [documentation](https://docs.github.com/en/developers/apps/building-oauth-apps/creating-an-oauth-app).

After, registed your OAuth Project, set the next variables.

```
NEXT_GH_CLIENT_ID=yourOAuthClientId
NEXT_GH_SECRET=yourOAuthSecret
```