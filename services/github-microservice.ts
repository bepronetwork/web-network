import axios from 'axios';

interface User {
  githubHandle: string;
  address: string;
  createdAt: string;
  id: number;
  updatedAt: string;
}

const client = axios.create({baseURL: process.env.API_HOST || 'http://localhost:3005'})
export default class GithubMicroService {

  static async createIssue(payload) {
    await client.post('/issues', payload);
  }
  static async getIssuesIds(issueIds) {
    const {data} = await client.get('/issues', {params: {issueIds}});
    return data;
  }

  static async getIssues() {
    const {data} = await client.get('/issues');
    return data;
  }

  static async getIssuesState(state: any) {
    const {data} =  await client.get('/issues', state);
    return data;
  }

  static async getIssueId(issueId: string | string[]) {
    const {data} = await client.get(`/issues/${issueId}`);
    return data;
  }

  static async getCommentsIssue(githubId: string | string[]) {
    const {data} = await client.get(`/issues/github/${githubId}/comments`);
    return data;
  }

  /**
   * Should merge the address and the github handle
   */
  static joinAddressToHandle(payload: {address: string, githubHandle: string}): Promise<boolean> {
    return client.post<string>(`/users/connect`, payload)
                 .then(({data}) => data === `ok`)
                 .catch((error) => {
                   console.log(`Error`, error)
                   return false;
                 });
  }

  /**
   * Should return user of address
   */
  static async getUserOf(address: string): Promise<User> {
    return client.get<User>(`/users/address/${address}`)
                 .then(({data}) => data)
  }

  /**
   * Should return the handle of a given wallet address
   */
  static async getHandleOf(address: string): Promise<any> {
    return GithubMicroService.getUserOf(address).then((data) => data?.githubHandle || ``).catch( _ => ``);
  }

}
