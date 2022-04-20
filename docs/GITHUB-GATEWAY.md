## 1. GITHUB REPOSITORYS MANAGER

In order to manage repositories issues and pull requests, the application requires a  Github Token. This should be treated as a bot account.

Follow this [documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) to generator a Github Token, remember of guarantee the permissions of scopes `repo` and `admin:repo_hook` and change `Expiration` to a highest time.

Update the .env file with the token and user;
```text
# .env

NEXT_PUBLIC_GH_TOKEN=yourGithubToken
NEXT_PUBLIC_GH_USER=yourGithubUser
```



## 2. DEFAULT REPOSITORY/BRANCH

Configure the default branch and repository, for ocasion no have others repositories registred. `master` is a default branch.

```text
# .env

NEXT_GH_MAINBRANCH=master
NEXT_GH_OWNER=
NEXT_GH_REPO=
```
