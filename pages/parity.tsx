import {useContext, useEffect, useState} from 'react';
import {ApplicationContext} from '@contexts/application';
import {Octokit} from 'octokit';
import {addTransaction} from '@reducers/add-transaction';
import {TransactionTypes} from '@interfaces/enums/transaction-types';
import {BeproService} from '@services/bepro-service';
import {updateTransaction} from '@reducers/update-transaction';
import GithubMicroService from '@services/github-microservice';
import ConnectWalletButton from '@components/connect-wallet-button';
import {formatNumberToString} from '@helpers/formatNumber';
import {changeLoadState} from '@reducers/change-load-state';
import {changeBalance} from '@reducers/change-balance';
import router from 'next/router';
import {toastInfo} from '@reducers/add-toast';

export default function ParityPage() {
  const {state: {currentAddress, balance,}, dispatch} = useContext(ApplicationContext);
  const [githubToken, setGithubToken] = useState(``);
  const [githubLogin, setGithubLogin] = useState(``);
  const [readRepoName, setReadRepoName] = useState(``);
  const [outputRepoName, setOutputRepoName] = useState(``);
  const [githubCreator, setGithubCreator] = useState(``);
  const [deployedContract, setDeployedContract] = useState(``);
  const [councilAmount, setCouncilAmount] = useState(``);
  const [issuesList, setIssuesList] = useState([]);

  const formItem = (label = ``, placeholder = ``, value = ``, onChange = (ev) => {}) =>
    ({label, placeholder, value, onChange})

  const formMaker = [
    formItem(`Github Token`, `Token to be able to login and act`, githubToken, (ev) => setGithubToken(ev?.target?.value)),
    formItem(`Github Login`, `Login handle of the owner of the token`, githubLogin, (ev) => setGithubLogin(ev?.target?.value)),
    formItem(`Read Repo`, `Github repo name to read from (pex bepro-js)`, readRepoName, (ev) => setReadRepoName(ev?.target?.value)),
    formItem(`Output Repo`, `Github repo name to output to (pex bepro-js-edge)`, outputRepoName, (ev) => setOutputRepoName(ev?.target?.value)),
    formItem(`New council amount`, `Set a new council amount`, councilAmount, (ev) => setCouncilAmount(ev?.target?.value)),
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
    const readRepoInfo = {owner: githubLogin, repo: readRepoName};
    const outRepoInfo = {owner: githubLogin, repo: outputRepoName};

    const openIssues = [];

    function mapOpenIssue({title = ``, number = 0, body = ``, labels = [], tokenAmount}) {
      const getTokenAmount = (lbls) => +lbls.find((label = ``) => label.search(/k (BEPRO|\$USDC)/) > -1)?.replace(/k (BEPRO|\$USDC)/, `000`) || 100000;

      if (labels.length && !tokenAmount)
        tokenAmount = getTokenAmount(labels.map(({name}) => name));
      if (!tokenAmount)
        tokenAmount = 100000;

      return ({title, number, body, tokenAmount,});
    }


    function getAllIssues(repoInfo) {
      try {
        return octokit.rest.issues.listForRepo({...repoInfo, state: `open`})
                      .then(({data}) => data)
      } catch (e) {
        console.log(`Failed to getAllIssues of`, repoInfo, e);
        return Promise.resolve([]);
      }
    }


    dispatch(changeLoadState(true))

    getAllIssues(readRepoInfo)
      .then(issues => {
        openIssues.push(...issues.map(mapOpenIssue));
        return getAllIssues(outRepoInfo)
      })
      .then(issues => {
        const filterExistingIssues = ({title = ``}) => !issues.some((item) => item.title === title);
        setIssuesList(openIssues.filter(filterExistingIssues).map(mapOpenIssue));
      })
      .finally(() => {
        dispatch(changeLoadState(false))
      })

  }

  function createIssue({title, body: description = `No description`, tokenAmount, number}) {

    const openIssueTx = addTransaction({type: TransactionTypes.openIssue, amount: +tokenAmount})
    dispatch(openIssueTx);

    const msPayload = {
      title, description, amount: 10 /*tokenAmount*/,
      creatorAddress: currentAddress, creatorGithub: githubCreator,
    }

    const scPayload = {tokenAmount: 10 /*tokenAmount*/, cid: currentAddress,};

    return BeproService.network.openIssue(scPayload)
                       .then(txInfo => {
                         BeproService.parseTransaction(txInfo, openIssueTx.payload)
                                     .then(block => dispatch(updateTransaction(block)))
                         return txInfo;
                       })
                       .then(txInfo =>
                         GithubMicroService.createIssue({
                                                          ...msPayload,
                                                          issueId: txInfo.events?.OpenIssue?.returnValues?.id
                                                        })
                                           .then(oknok =>
                                             GithubMicroService.getIssueId(txInfo.events?.OpenIssue?.returnValues?.id)
                                                               .then((info) => info?.githubId && createComments(number, info.githubId))
                                                               .then(() => oknok)))
                       .catch(e => {
                         dispatch(updateTransaction({...openIssueTx.payload as any, remove: true}));
                         console.error(`Failed to createIssue`, e);
                         return false;
                       })
  }

  function createIssuesFromList() {
    BeproService.login()
                .then(_ => GithubMicroService.getUserOf(currentAddress))
                .then(user => setGithubCreator(user.githubLogin))
                .then(_ => Promise.all(issuesList.map(createIssue)))
                .then(okList => {
                  console.log(`All true?`, !okList.some(b => !b));
                  console.log(`How many trues vs falses?`, okList.reduce((p, c) => p += c && 1 || -1, 0))
                  console.log(`Length of issuesList,`, issuesList.length);
                  console.log(`okList`, okList);
                })
                .catch(e => {
                  console.error(`Some error occurred while trying to open issues,`, e);
                })
  }

  function deployNewContract() {
    BeproService.network
                .deploy({
                          settlerTokenAddress: "0x7a7748bd6f9bac76c2f3fcb29723227e3376cbb2",
                          transactionTokenAddress: "0x7a7748bd6f9bac76c2f3fcb29723227e3376cbb2",
                          governanceAddress: currentAddress,
                        })
                .then(info => {
                  console.log(`Deployed!`)
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
                  console.log(`Council Changed!`);
                  console.table(info);
                })
                .catch(e => {
                  console.error(`Error deploying`, e);
                })
  }

  function renderIssuesList({title = ``, body = ``, tokenAmount = 100000,}, i: number) {
    return (
      <div className="mb-4" key={i}>
        <div className="content-wrapper">
          <strong className="mb-2">Title:</strong> {title}

          <span className="fs-small d-block mb-1">
            {(body || `No body?`).substr(0, 500).concat(`...`)}
          </span>
          <hr />
          <span className="fs-smallest d-block mbn-2">{formatNumberToString(tokenAmount)} BEPRO</span>
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

  function getSumOfTokenAmount() {
    return issuesList.reduce((p, c) => p += +(c.tokenAmount || 100000), 0);
  }

  function getCostClass() {
    return `text-${getSumOfTokenAmount() > balance.bepro ? `danger` : `white`}`;
  }

  useEffect(() => {
    if (!currentAddress)
      return;

    if (currentAddress !== `0xA0dac0a23707fd504c77cd97c40a34b0256C51F8`)
      router.push(`/account`);
    else BeproService.getBalance('bepro').then(bepro => dispatch(changeBalance({bepro})));

  }, [currentAddress])

  return <>
    <div className="container mb-5">
      <ConnectWalletButton asModal={true} />
      <div className="div mt-3 mb-4 content-wrapper">
        {formMaker.map(renderFormItems)}
        <div className="row mb-3">
          <label className="p-small trans mb-2">New contract address</label>
          <input value={deployedContract} readOnly={true} type="text" className="form-control" placeholder={`Address will appear here`}/>
        </div>
        <div className="row">
          <div className="col d-flex justify-content-end align-items-center">
            <button className="btn btn-md me-2 btn-primary" onClick={() => deployNewContract()}>Deploy contract</button>
            <button className="btn btn-md btn-primary me-auto" disabled={!councilAmount} onClick={() => updateCouncilAmount()}>Update council amount</button>
            {issuesList.length && <span className="fs-small me-2">Will cost <span className={getCostClass()}>{formatNumberToString(getSumOfTokenAmount())} BEPRO </span> / {formatNumberToString(balance.bepro)} BEPRO</span> || ``}
            {issuesList.length && <button className="btn btn-trans mr-2" onClick={() => createIssuesFromList()}>Create Issues</button> || ``}
            <button className="btn btn-md btn-primary" disabled={isValidForm()} onClick={() => listIssues()}>List issues</button>
          </div>
        </div>
      </div>
      {issuesList.map(renderIssuesList)}
    </div>
  </>
}
