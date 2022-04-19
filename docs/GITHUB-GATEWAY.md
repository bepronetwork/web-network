## 1. GITHUB REPOSITORYS MANAGER

To be possible attach managering repositories, issues, pullrequests and branchs, is required authenticating one account with [Github Token](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token). this account will recive permission of all repositories registred in the project for be manipulate using github api. So is recomended create a new account for this purpose only, like a bot account.

Follow this [documentation](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/creating-a-personal-access-token) to generate your Github Token, remember of guarantee the permissions of scoopes `repo` and `admin:repo_hook` and change `Expiration` to a highest time.

After it, we can copy the token and set in
```text
# .env

NEXT_PUBLIC_GH_TOKEN=yourGithubToken
NEXT_PUBLIC_GH_USER=yourGithubUser
```



## 2. DEFAULT REPOSITORY/BRANCH

It's possivel defined repository and branch default, for ocasion no have others repositories registred. `master` is a default branch.

```text
# .env

NEXT_GH_MAINBRANCH=master
NEXT_GH_OWNER=
NEXT_GH_REPO=
```
