## 1. GITHUB REPOSITORYS MANAGER

In order to manage repositories issues and pull requests, the application requires a Github Token. This should be treated as a bot account.

Follow this [documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) to generator a Github Token, remember of guarantee the permissions of scopes `repo` and `admin:repo_hook` and change `Expiration` to a highest time.

Update the .env file with the token and user;

```text
# .env

# Create new github token for Bot
NEXT_GH_TOKEN=yourGithubToken
NEXT_PUBLIC_GH_USER=yourGithubUserLogin
```

## 2. DEFAULT REPOSITORY/BRANCH

It's necessary to configure the default branch and repository, for ocassion of not have others repositories this will be registered. `master` is the default branch.

This repository will be registered and available only for the default network.

```text
# .env

NEXT_GH_MAINBRANCH=master
NEXT_GH_OWNER=
NEXT_GH_REPO=
```
