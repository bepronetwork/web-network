import GithubMicroService from '@services/github-microservice';
import {BeproService} from '@services/bepro-service';
import {useContext, useState} from 'react';
import {ApplicationContext} from '@contexts/application';
import {Octokit} from '@octokit/core';

export default function FalconPunchPage() {
  const {state: {currentAddress}} = useContext(ApplicationContext);
  const [githubToken, setGithubToken] = useState(``);

  function listAllUsers() {

    async function getGithubInfo(ghlogin: string) {
      const octokit = new Octokit({auth: githubToken});

      return octokit.rest.users.getByUsername({username: ghlogin,})
    }
    async function hasEthBalance(address: string) {
      return BeproService.login()
                         .then(() => BeproService.bepro.web3.eth.getBalance(currentAddress as any))
                         .then(eth => eth > 0)
    }

    async function getInfo({githubLogin, address, createdAt, updatedAt, id}) {
      const repos = await getGithubInfo(githubLogin);
      const eth = await hasEthBalance(address);
    }

    GithubMicroService.getAllUsers()
                      .then(users => Promise.all(users.map(getInfo)))
  }

  return <>
    <div className="container mb-5">
      <div className="mt-3 content-wrapper">
        <div className="row mb-3">
          <button className="btn btn-md btn-primary">list all users</button>
        </div>
      </div>
      <div className="mt-3 content-wrapper">
        <div className="row mb-3">

        </div>
      </div>
    </div>
  </>
}
