import GithubMicroService from '@services/github-microservice';
import {BeproService} from '@services/bepro-service';
import React, {useContext, useEffect, useState} from 'react';
import {ApplicationContext} from '@contexts/application';
import {Octokit} from 'octokit';
import router from 'next/router';
import ConnectWalletButton from '@components/connect-wallet-button';

export default function FalconPunchPage() {
  const {state: {currentAddress}} = useContext(ApplicationContext);
  const [githubToken, setGithubToken] = useState(``);
  const [userList, setUserList] = useState<{created_at: string; login: string; public_repos: string; eth: number}[]>([])

  function toDays(date = ``) {
    return +new Date(date) / (24 * 60 * 60 * 1000)
  }

  function listAllUsers() {

    async function getGithubInfo(ghlogin: string) {
      const octokit = new Octokit({auth: githubToken});

      return octokit.rest.users.getByUsername({username: ghlogin,})
                    .then(({data}) => data)
                    .catch(() => null)
    }

    async function hasEthBalance(address: string) {
      return BeproService.login()
                         .then(() => BeproService.bepro.web3.eth.getBalance(address as any))
                         .then(eth => eth)
    }

    async function getInfo({githubLogin, address, createdAt, updatedAt, id}) {
      const ghInfo = await getGithubInfo(githubLogin);
      const eth = await hasEthBalance(address);

      return {...ghInfo, eth};
    }

    GithubMicroService.getAllUsers()
                      .then(users => Promise.all(users.map(getInfo)))
                      .then(setUserList as any)
  }

  function renderUserRow({created_at, login, public_repos, eth}) {
    return <div className="row mb-3">
      <div className="col">@{login}</div>
      <div className={`col text-${toDays(created_at) >= 7 ? `success` : `danger`}`}>&gt; 7 {toDays(created_at) > 7 ? `yes` : `no`} </div>
      <div className={`col text-${!!public_repos ? `success` : `danger`}`}>&gt; 0 repos {!!public_repos ? `yes` : `no`} </div>
      <div className={`col text-${!!eth ? `success` : `danger`}`}>&gt; 0 eth {!!eth ? `yes` : `no`} </div>
    </div>
  }

  useEffect(() => {
    if (!currentAddress)
      return;

    if (currentAddress !== `0xA0dac0a23707fd504c77cd97c40a34b0256C51F8`)
      router.push(`/`);

  }, [currentAddress])

  return <>
    <div className="container mb-5">
      <ConnectWalletButton asModal={true} />
      <div className="mt-3 content-wrapper">
        <div className="row mb-3">
          <div className="col">
            <label className="p-small trans mb-2">Github Token</label>
            <input value={githubToken} onChange={(ev) => setGithubToken(ev?.target?.value)} type="text" className="form-control" placeholder={`Github token`}/>
          </div>
        </div>
        <div className="row mb-3">
          <div className="col d-flex justify-content-end">
            {currentAddress && <button className="btn btn-md btn-primary" onClick={listAllUsers}>list all users</button> || `` }
          </div>
        </div>
      </div>
      <div className="mt-3 content-wrapper">
        {userList.map(renderUserRow)}
      </div>
    </div>
  </>
}
