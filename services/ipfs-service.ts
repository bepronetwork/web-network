import axios from 'axios';
import FormData from 'form-data';
import { v4 as uuidv4 } from 'uuid';

const host = process.env.NEXT_IPFS_HOST || 'ipfs.infura.io'
const port = process.env.NEXT_IPFS_PORT|| '5001'
const auth = 'Basic ' + Buffer.from(process.env.NEXT_IPFS_PROJECT_ID + ':' + process.env.NEXT_IPFS_PROJECT_SECRET).toString('base64')
const baseURL = `https://${host}:${port}/api/v0`

export async function add(file: Buffer | string): Promise<{hash:string, fileName:string, size: string}>{
  const isBuffer = Buffer.isBuffer(file);
  var content = isBuffer ? Buffer.from(file) : file;
  const form = new FormData();

  form.append('file', content, isBuffer && `${uuidv4()}.png`);

  const headers = {
    'Content-Type': `multipart/form-data; boundary=${form.getBoundary()}`,
    'Accept': '*/*',
    'Connection': 'keep-alive',
    authorization: auth
  }

  const {data} = await axios.post(
    `${baseURL}/add?stream-channels=true&progress=false`, 
    form,
    {
      headers
    })
  console.log(data)
  return { hash: data.Hash, fileName: data.Name, size: data.Size };
}

export default {add};