import { Client } from '@elastic/elasticsearch'

const client = new Client({
  node: process?.env?.NEXT_ELASTIC_SEARCH_URL,
})

const Levels = {log: 'LOG', info: 'INFO', error: 'ERROR'};

const output = (level: string, message: string|any, rest) => { // eslint-disable-line
  const msg = rest.length ? message : 'No message';
  
  if (!rest.length || !rest)
    rest = message;

  const string = `(${level}) (${new Date().toISOString()}) ${msg}\n`;
  console.log(string, rest);
  

  client?.index({
      index: "web-network",
      document: {
        level,
        timestamp: new Date(),
        message, 
        rest
      }
  })
  
}
/* eslint-disable */ //Todo complex output
const info = (message?, ...rest: any) => output(Levels.info, message, rest);
const error = (message?, ...rest: any) => output(Levels.error, message, rest);
const log = (message?, ...rest: any) => output(Levels.log, message, rest);
/* eslint-disable */
export {info, error, log};