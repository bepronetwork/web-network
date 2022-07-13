
import { Client } from "@elastic/elasticsearch";
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();

const Levels = {log: 'LOG', info: 'INFO', error: 'ERROR'};

const output = (level: string, message: string|any, rest) => { // eslint-disable-line
  const msg = rest.length ? message : 'No message';
  
  if (!rest.length || !rest)
    rest = message;

  const string = `(${level}) (${new Date().toISOString()}) ${msg}\n`;
  console.log(string, rest);
  if(serverRuntimeConfig?.elasticSearchUrl 
    && serverRuntimeConfig?.elasticSearchUser
     && serverRuntimeConfig?.elasticSearchPassword) {
      
    const client = new Client({
      node: serverRuntimeConfig.elasticSearchUrl,
      auth: {
        username: serverRuntimeConfig.elasticSearchUser,
        password: serverRuntimeConfig.elasticSearchPassword,
      }
    })
  
    client?.index({
        index: "web-network",
        document: {
          level,
          timestamp: new Date(),
          message, 
          rest
        }
    }).catch(e => console.log(e))
  }
}
/* eslint-disable */ //Todo complex output
const info = (message?, ...rest: any) => output(Levels.info, message, rest);
const error = (message?, ...rest: any) => output(Levels.error, message, rest);
const log = (message?, ...rest: any) => output(Levels.log, message, rest);
/* eslint-disable */
export {info, error, log};