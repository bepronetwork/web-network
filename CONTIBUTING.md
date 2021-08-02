# Contributing

### Setting up
First, fork the project on github and clone it on your machine and add bepronetwork as a remote
```
$ git clone git@github.com:[your-handle]/web-network.git
$ cd web-network
$ git remote add bepronetwork git@github.com:bepronetwork/web-network.git
```

### Creating changes
First checkout `bepronetwork/main` and then create a branch from that identifying the issue,

```
$ git checkout -b network/main bepronetwork/main 
$ git pull
$ git checkout -b [feature|hotfix|fix]/[issue-number]
```

Make your needed changes and commit them. When you're ready to create a pull request, don't forget
to rebase your branch from `bepronework/main` again:

```
$ git checkout network/main
$ git pull
$ git checkout [your-feature-branch]
$ git rebase network/main
$ git push
```

Resolve any conflicts and push the result. (You might need to use `--force` because you are
rewritting the history _of your branch_).
