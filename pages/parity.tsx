import {useContext, useEffect, useState} from 'react';
import {ApplicationContext} from '@contexts/application';
import {Octokit} from 'octokit';
import {addTransaction} from '@reducers/add-transaction';
import {TransactionTypes} from '@interfaces/enums/transaction-types';
import {BeproService} from '@services/bepro-service';
import {updateTransaction} from '@reducers/update-transaction';
import ConnectWalletButton from '@components/connect-wallet-button';
import {formatNumberToString} from '@helpers/formatNumber';
import {changeLoadState} from '@reducers/change-load-state';
import router from 'next/router';
import {toastError, toastInfo} from '@reducers/add-toast';
import {SETTLER_ADDRESS, TRANSACTION_ADDRESS} from '../env';
import {ReposList} from '@interfaces/repos-list';
import {ListGroup} from 'react-bootstrap';
import ConnectGithub from '@components/connect-github';
import Button from '@components/button';
import useApi from '@x-hooks/use-api';

export default function ParityPage() {
  const {state: {currentAddress, balance,}, dispatch} = useContext(ApplicationContext);
  const [githubToken, setGithubToken] = useState(``);
  const [githubLogin, setGithubLogin] = useState(``);
  const [readRepoName, setReadRepoName] = useState(``);
  const [outputRepoName, setOutputRepoName] = useState(``);
  const [githubCreator, setGithubCreator] = useState(``);
  const [deployedContract, setDeployedContract] = useState(``);
  const [councilAmount, setCouncilAmount] = useState(``);
  const [settlerTokenName, setSettlerTokenName] = useState(``);
  const [settlerTokenSymbol, setSettlerTokenSymbol] = useState(``);
  const [settlerTokenAddress, setSettlerTokenAddress] = useState(``);
  const [issuesList, setIssuesList] = useState([]);
  const [reposList, setReposList] = useState<ReposList>([]);
  const [availReposList, setAvailableList] = useState<string[]>([]);
  const {getUserOf, createIssue: apiCreateIssue, patchIssueWithScId, createRepo, getReposList, removeRepo: apiRemoveRepo} = useApi();

  const formItem = (label = ``, placeholder = ``, value = ``, onChange = (ev) => {}) =>
    ({label, placeholder, value, onChange})

  const formMaker = [
    formItem(`Github Token`, `Token to be able to login and act`, githubToken, (ev) => setGithubToken(ev?.target?.value)),
    formItem(`Github Login`, `Login handle of the owner of the token`, githubLogin, (ev) => setGithubLogin(ev?.target?.value)),
    // formItem(`Read Repo`, `Github repo name to read from (pex bepro-js)`, readRepoName, (ev) => setReadRepoName(ev?.target?.value)),
  ]

  function isValidForm() {
    return formMaker.some(({value}) => !value);
  }

  async function createComments(issue_number, out_issue_number) {
    const octokit = new Octokit({auth: githubToken});
    const readRepoInfo = {owner: githubLogin, repo: readRepoName};
    const outRepoInfo = {owner: githubLogin, repo: outputRepoName};

    async function getComments(page = 1, comments = []) {
      const mapComment = ({user: {login = ``,}, created_at = ``, updated_at = ``, body = ``}) =>
        ({login, createdAt: created_at, updatedAt: updated_at, body,});

      return octokit.rest.issues.listComments({...readRepoInfo, issue_number, page})
                    .then(({data}) => {
                      if (data.length === 100)
                        return getComments(page + 1, [...comments, ...data.map(mapComment)])
                      return [...comments, ...data.map(mapComment)];
                    })
    }

    function createComment({login = ``, body = ``, createdAt = ``, updatedAt = ``, issue_number}) {
      body = `> Created by ${login} at ${new Date(createdAt).toISOString()} ${updatedAt ? `and updated at ${new Date(updatedAt).toISOString()}` : ``}\n\n`.concat(body);
      return octokit.rest.issues.createComment({...outRepoInfo, issue_number: out_issue_number, body})
    }

    const comments = await getComments();

    for (const comment of comments)
      await createComment(comment);

  }

  function listIssues() {
    const octokit = new Octokit({auth: githubToken});

    function getRepoId(path: string) {
      return reposList.find(({githubPath}) => {
        return githubPath === path
      }).id;
    }

    function mapOpenIssue({title = ``, number = 0, body = ``, labels = [], tokenAmount, repository_url, user: {login: creatorGithub}}) {
      const getTokenAmount = (lbls) => +lbls.find((label = ``) => label.search(/k \$?(BEPRO|USDC)/) > -1)?.replace(/k \$?(BEPRO|USDC)/, `000`) || 100000;

      if (labels.length && !tokenAmount)
        tokenAmount = getTokenAmount(labels.map(({name}) => name));
      if (!tokenAmount)
        tokenAmount = 50000;

      return ({title, number, body, tokenAmount, creatorGithub, repository_id: getRepoId(repository_url?.split(`/`)?.slice(-2)?.join(`/`))});
    }

    async function getAllIssuesRecursive({githubPath}, page = 1, pool = []) {
      const [owner, repo] = githubPath.split(`/`);
      return octokit.rest.issues.listForRepo({owner, repo, state: `open`, per_page: 100, page})
                    .then(({data}) =>
                            data.length === 100 ? getAllIssuesRecursive({githubPath}, page+1, pool.concat(data)) : pool.concat(data))
                    .catch(e => {
                      console.error(`Failed to get issues for`, githubPath, page, e);
                      return pool;
                    })
    }

    dispatch(changeLoadState(true))

    Promise.all(reposList.map(repo => getAllIssuesRecursive(repo)))
           .then(allIssues => allIssues.flat().map(mapOpenIssue))
           .then(async issues => {
             const openIssues = [];
             for (const issue of issues) {
               console.debug(`(SC) Checking ${issue.title}`);
               if (!(await BeproService.network.getIssueByCID({issueCID: `${issue.repository_id}/${issue.number}`}))?.cid)
                 openIssues.push(issue);
             }

             return openIssues;
            })
            .then(setIssuesList)
            .catch(e => {
              console.error(`Found error`, e);
            })
            .finally(() => {
              dispatch(changeLoadState(false))
            })

  }

  function createIssue({title, body: description = `No description`, tokenAmount, number, repository_id, creatorGithub = githubLogin}) {

    const openIssueTx = addTransaction({type: TransactionTypes.openIssue, amount: +tokenAmount})
    dispatch(openIssueTx);

    const msPayload = {
      title, description, amount: tokenAmount,
      creatorAddress: currentAddress, creatorGithub,
      githubIssueId: number.toString(), repository_id,
    }

    const scPayload = {tokenAmount: tokenAmount.toString(),};

    console.debug(`scPayload,`, scPayload, `msPayload`, msPayload);

    return apiCreateIssue(msPayload)
                             .then(cid => {
                               if (!cid)
                                 throw new Error(`Failed to create github issue!`);
                               return BeproService.network.openIssue({...scPayload, cid: [repository_id, cid].join(`/`)})
                                                  .then(txInfo => {
                                                    // BeproService.parseTransaction(txInfo, openIssueTx.payload)
                                                    //             .then(block => dispatch(updateTransaction(block)))
                                                    return {githubId: cid, issueId: txInfo.events?.OpenIssue?.returnValues?.id && [repository_id, cid].join(`/`)};
                                                  })
                             })
                             .then(({githubId, issueId}) => {
                               if (!issueId)
                                 throw new Error(`Failed to create issue on SC!`);

                               return patchIssueWithScId(repository_id, githubId, issueId)
                             })
                             .then(result => {
                               if (!result)
                                 // return dispatch(updateTransaction({...openIssueTx.payload as any, remove: true}));
                               return true;
                             })
                             .catch(e => {
                               console.error(`Failed to createIssue`, e);
                               if (e?.message?.search(`User denied`) > -1)
                                dispatch(updateTransaction({...openIssueTx.payload as any, remove: true}));
                               return false;
                             })

  }

  function createIssuesFromList() {

    return Promise.all(issuesList.map(createIssue))
                  .then(okList => {
                    console.debug(`All true?`, !okList.some(b => !b));
                    console.debug(`How many trues vs falses?`, okList.reduce((p, c) => p += c && 1 || -1, 0))
                    console.debug(`Length of issuesList,`, issuesList.length);
                    console.debug(`okList`, okList);
                  })
                  .catch(e => {
                    console.error(`Some error occurred while trying to open issues,`, e);
                  })
  }

  function deployNewContract() {
    BeproService.network
                .deploy({
                          settlerTokenAddress: SETTLER_ADDRESS,
                          transactionTokenAddress: TRANSACTION_ADDRESS,
                          governanceAddress: currentAddress,
                        })
                .then(info => {
                  console.debug(`Deployed!`)
                  console.table(info);
                  dispatch(toastInfo(`Deployed!`));
                  setDeployedContract(info.contractAddress);
                  return true;
                })
  }

  function updateCouncilAmount() {
    BeproService.network.changeCouncilAmount(+councilAmount)
                .then(info => {
                  dispatch(toastInfo(`Council amount changed!`));
                  console.debug(`Council Changed!`);
                  console.table(info);
                })
                .catch(e => {
                  console.error(`Error deploying`, e);
                })
  }

  function deploySettlerToken() {
    BeproService.ERC20.deploy({
                                name: settlerTokenName,
                                symbol: settlerTokenSymbol,
                                cap: "10000000000000000000000000000",
                                distributionAddress: currentAddress
                              })
                .then(txInfo => {
                  console.debug(txInfo);
                  dispatch(toastInfo(`Deployed!`));
                  setSettlerTokenAddress(txInfo.contractAddress);
                })
  }

  function getSelfRepos() {
    getUserOf(currentAddress)
                      .then((user) => {
                        setGithubLogin(user?.githubLogin);
                        setGithubToken(user?.accessToken);
                      })
                      .then(() => {
                        if (!githubToken)
                          return [];
                        const octokit = new Octokit({auth: githubToken});

                        return octokit.rest.orgs.listForUser({username: githubLogin})
                               .then(({data}) => data)
                               .then(orgs => orgs.map(org => org.login))
                               .then(orgs => {
                                 function listReposOf(username: string) {
                                   return octokit.rest.repos.listForUser({username}).then(({data}) => data);
                                 }
                                 return Promise.all(orgs.map(listReposOf))
                                               .then(allOrgs => allOrgs.flat())
                                               .then(allOrgsRepos => allOrgsRepos.filter(repo => repo.permissions.admin))
                               })
                               .then(orgRepos => {
                                 return octokit.rest.repos.listForUser({username: githubLogin}).then(({data}) => data)
                                        .then(repos => repos.concat(orgRepos))
                               })
                      })
                      .then(async (repos) => {
                        setReposList(await getReposList(true));
                        setAvailableList(repos.filter(repo => repo.has_issues && !repo.fork).map(repo => repo.full_name))
                      })
                      .catch(e => {
                        console.error(`Failed to grep user`, e);
                      })
  }

  async function addNewRepo(owner, repo) {
    const created = await createRepo(owner, repo);

    if (!created)
      return dispatch(toastError(`Failed to create repo`));

    setReposList(await getReposList(true));
  }

  async function removeRepo(id: string) {
    return apiRemoveRepo(id)
                             .then(async (result) => {
                               if (!result)
                                 return dispatch(toastError(`Couldn't remove repo`));

                               setReposList(await getReposList(true))
                             });
  }

  function getSumOfTokenAmount() {
    return issuesList.reduce((p, c) => p += +(c.tokenAmount || 50000), 0);
  }

  function getCostClass() {
    return `text-${getSumOfTokenAmount() > balance.bepro ? `danger` : `white`}`;
  }

  function renderIssuesList({title = ``, body = ``, tokenAmount = 50000, repository_id = null}, i: number) {
    return (
      <div className="mt-4" key={i}>
        <div className="content-wrapper">
          <strong className="mb-2">Title:</strong> {title}

          <span className="fs-small d-block mb-1">
            {(body || `No body?`).substr(0, 500).concat(`...`)}
          </span>
          <hr />
          <span className="fs-smallest d-block mbn-2">{formatNumberToString(tokenAmount)} BEPRO</span>
          <span className="fs-smallest d-block mbn-2">{reposList.find(repo => repo.id === repository_id)?.githubPath}</span>
        </div>
      </div>
    )
  }

  function renderFormItems({label, placeholder, value, onChange}) {
    return <div className="row mb-3">
        <label className="p-small trans mb-2">{label}</label>
        <input value={value} onChange={onChange} type="text" className="form-control" placeholder={placeholder}/>
      </div>
  }

  function renderAvailListItem(repoPath: string) {
    const [owner, repo] = repoPath.split(`/`)
    const isActive = reposList.find(({githubPath}) => githubPath === repoPath);
    return <ListGroup.Item active={!!isActive}
                           variant={isActive ? `success` : `shadow`} action={true}
                           onClick={() => !isActive ? addNewRepo(owner, repo) : removeRepo(isActive.id.toString())}>{repoPath}</ListGroup.Item>
  }

  function changeRedeem() {
    BeproService.network.params.contract.getContract()
                .methods.changeRedeemTime(60).send({from: currentAddress})
                .then(console.log)
  }

  useEffect(() => {
    if (!currentAddress)
      return;

    if (currentAddress !== process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS)
      router.push(`/account`);

    getSelfRepos();

  }, [currentAddress])

  return <>
    <div className="container mb-5">
      <ConnectWalletButton asModal={true} />
      <div className="mt-3 content-wrapper">
        <div className="row mb-3">
          <label className="p-small trans mb-2">New contract address</label>
          <input value={deployedContract} readOnly={true} type="text" className="form-control" placeholder={`Address will appear here`}/>
        </div>
        <div className="row mb-3">
          <label className="p-small trans mb-2">New council amount</label>
          <input className="form-control" value={councilAmount} onChange={(e) => setCouncilAmount(e?.target?.value)} type="text" placeholder={`Amount needed to be a council member`}/>
        </div>
        <hr />
        <div className="row mb-3 mxn-4">
          <div className="col">
            <label className="p-small trans mb-2 ml-2">New settler token name</label>
            <input className="form-control" placeholder="pex BEPRO" value={settlerTokenName} onChange={(e) => setSettlerTokenName(e?.target.value)}/>
          </div>
          <div className="col">
            <label className="p-small trans mb-2 ml-2">New settler token symbol</label>
            <input className="form-control" placeholder="pex $BEPRO" value={settlerTokenSymbol} onChange={(e) => setSettlerTokenSymbol(e?.target.value)}/>
          </div>
        </div>
        <div className="row mb-3">
          <label className="p-small trans mb-2">Settler token address</label>
          <input className="form-control" value={settlerTokenAddress} readOnly={true}/>
        </div>

        <div className="row">
          <div className="col d-flex justify-content-end align-items-center">
            <Button className="me-2" onClick={() => deployNewContract()}>Deploy contract</Button>
            <Button className="me-2" disabled={!councilAmount} onClick={() => updateCouncilAmount()}>Update council amount</Button>
            <Button disabled={!settlerTokenName || !settlerTokenSymbol} onClick={() => deploySettlerToken()}>Deploy settler token</Button>
            <Button onClick={() => changeRedeem()}>Change redeem to 2mins</Button>

          </div>
        </div>
      </div>
      <div className="div mt-3 mb-4 content-wrapper">
        {formMaker.map(renderFormItems)}
      </div>
      <div className="content-wrapper mt-3">
        <div className="row">
          <div className="col text-center">
              { githubToken && <span className="d-block mb-2">Select a repository to add it to the microservice list</span> || <ConnectGithub /> }
          </div>
        </div>
        <div className="row">
          <div className="col">
            <ListGroup>
              {availReposList.map(renderAvailListItem)}
            </ListGroup>
          </div>
        </div>
        <div className="row mt-3">
          <div className="col d-flex justify-content-end">
            {issuesList.length && <span className="fs-small me-2">Will cost <span className={getCostClass()}>{formatNumberToString(getSumOfTokenAmount())} BEPRO </span> / {formatNumberToString(balance.bepro)} BEPRO</span> || ``}
            {issuesList.length && <Button className="mr-2" outline onClick={() => createIssuesFromList()}>Create Issues</Button> || ``}
            { githubToken && reposList.length && <Button className="mr-2" disabled={isValidForm()} onClick={() => listIssues()}>List issues</Button> || `` }
            { githubToken && !availReposList.length && <Button onClick={getSelfRepos}>load repos</Button> || `` }
          </div>
        </div>
      </div>
      {issuesList.map(renderIssuesList)}
    </div>
  </>
}
