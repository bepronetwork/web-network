import {User} from '@interfaces/api-response';
import {BeproService} from '@services/bepro-service';
import React, {useContext, useEffect, useState} from 'react';
import {ApplicationContext} from '@contexts/application';
import {Octokit} from 'octokit';
import router from 'next/router';
import ConnectWalletButton from '@components/connect-wallet-button';
import useApi from '@x-hooks/use-api';
import {GetServerSideProps} from 'next';
import {getSession} from 'next-auth/react';
import {serverSideTranslations} from 'next-i18next/serverSideTranslations';

export default function FalconPunchPage() {
  const {state: {currentAddress}} = useContext(ApplicationContext);
  const [githubToken, setGithubToken] = useState(``);
  const [userList, setUserList] = useState<{created_at: string; login: string; public_repos: number; eth: number}[]>([])
  const {getAllUsers} = useApi();

  function toDays(date = ``) {
    return +new Date(date) / (24 * 60 * 60 * 1000)
  }

  function listAllUsers() {

    async function getGithubInfo(ghlogin: string) {
      const octokit = new Octokit({auth: githubToken});

      return octokit.rest.users.getByUsername({username: ghlogin,})
                    .then(({data}) => data)
                    .catch(() => ({created_at: '0', login: ghlogin, public_repos: 0,}))
    }

    async function hasEthBalance(address: string) {
      return BeproService.login()
                         .then(() => BeproService.bepro.web3.eth.getBalance(address as any))
                         .then(eth => +eth)
                         .catch(e => {
                           console.error(`Error on get eth`, e);
                           return 0;
                         })
    }

    async function getInfo({githubLogin, address, createdAt, updatedAt, id}: Partial<User>) {
      const ghInfo = await getGithubInfo(githubLogin);
      const eth = await hasEthBalance(address);

      setUserList(prev => [...prev as any, {...ghInfo, eth}]);
    }

    getAllUsers()
                      .then(users => Promise.all(users.map(getInfo)))
                      .catch(e => {
                        console.error(`Failed to get users`, e);
                      })
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

    if (currentAddress !== process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS)
      router.push(`/`);

  }, [currentAddress])

  return <>
    <div className="container mb-5">
      <ConnectWalletButton asModal={true} />
      <br />
      <br />
      <br />
      <br />
      <div className="content-wrapper">
        <div className="row mb-3">
          <div className="col">
            <label className="p-small mb-2">Github Token</label>
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

export const getServerSideProps: GetServerSideProps = async ({locale}) => {
  return {
    props: {
      session: await getSession(),
      ...(await serverSideTranslations(locale, ['common',])),
    },
  };
};
