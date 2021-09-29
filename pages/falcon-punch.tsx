import GithubMicroService from '@services/github-microservice';
import {BeproService} from '@services/bepro-service';
import {useContext, useState} from 'react';
import {ApplicationContext} from '@contexts/application';
import {Octokit} from 'octokit';

export default function FalconPunchPage() {
  const {state: {currentAddress}} = useContext(ApplicationContext);
  const [githubToken, setGithubToken] = useState(``);
  const [userList, setUserList] = useState<{created_at: string; username: string; public_repos: string; eth: number}[]>([])

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
