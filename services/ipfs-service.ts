import {create} from 'ipfs-http-client';


class IpfsStorage {
  
  private ipfs;

  constructor() {

    if(!process.env.NEXT_IPFS_PROJECT_ID || !process.env.NEXT_IPFS_PROJECT_SECRET){
      throw new Error("Please provide a valid IPFS Project Env, you can find one at infura.io")
    }

    const auth = 'Basic ' + Buffer.from(process.env.NEXT_IPFS_PROJECT_ID + ':' + process.env.NEXT_IPFS_PROJECT_SECRET).toString('base64')
    
    const headers = {
        authorization: auth
    }

    this.ipfs = create({
      host: process.env.NEXT_IPFS_HOST|| 'ipfs.infura.io',
      port: Number(process.env.NEXT_IPFS_PORT)||5001,
      protocol:  process.env.NEXT_IPFS_PROTOCOL|| 'https',
      headers
    });
  }

  async add({data}):Promise<{path:string, cid:string, size: string}>{
    const { path, cid, size } = await this.ipfs.add(data);
    return { path, cid, size };
  }

  async get({cid}):Promise<any>{
    return new Promise( async (resolve, reject) => {
      try{
        for await (const file of this.ipfs.get(cid)) {
          if (!file.content) continue;
          const content = []
          for await (const chunk of file.content) {
            content.push(chunk)
          }
          resolve(content.toString())
        }
      }catch(err){
        reject(err);
      }
    })
  }
}

export default IpfsStorage;
