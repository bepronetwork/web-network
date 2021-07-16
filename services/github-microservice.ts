import axios from 'axios';


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
    const {data} = await axios.get(API_HOST  + '/issues');
    return data;
  }

  static async getIssuesState(state: any) {
    const {data} = await axios.get(API_HOST  + '/issues', state);
    return data;
  }

  static async getIssueId(issueId: string | string[]) {
    const {data} = await axios.get(API_HOST  + `/issues/${issueId}`);
    return data;
  }

  static async getCommentsIssue(githubId: string | string[]) {
    const {data} = await axios.get(API_HOST  + `/issues/github/${githubId}/comments`);
    return data;
  }

  /**
   * Should merge the address and the github handle
   */
  static joinAddressToHandle(payload: {address: string, githubHandle: string}): Promise<boolean> {
    return client.post<string>(`/connect`, payload)
                 .then(({data}) => data === `ok`)
                 .catch((error) => {
                   console.log(`Error`, error)
                   return false;
                 });
  }

  /**
   * Should return the handle of a given wallet address
   */
  static async getHandleOf(address: string): Promise<string> {
    // return client.get(`/address`)
    return Promise.resolve(``)
  }

  /**
   * Sends a token to GithubMicroService and expects a github handle string
   */
  static async tradeTokenForHandle(code: string): Promise<string> {
    return Promise.resolve(`@handle`);
  }

}
