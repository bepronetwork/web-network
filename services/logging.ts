import {Client} from "@elastic/elasticsearch";
import getConfig from "next/config";
const { serverRuntimeConfig } = getConfig();

const Levels = {none: '', log: 'log', info: 'info', error: 'error', DEBUG: 'debug'};
let DebugLevel;

(function (DebugLevel) {
  DebugLevel[DebugLevel["none"] = 0] = "none";
  DebugLevel[DebugLevel["error"] = 1] = "error";
  DebugLevel[DebugLevel["warn"] = 2] = "warn";
  DebugLevel[DebugLevel["info"] = 3] = "info";
  DebugLevel[DebugLevel["log"] = 4] = "log";
})(DebugLevel || (DebugLevel = {}))

export const LOG_LEVEL = serverRuntimeConfig.logLevel ? parseInt(serverRuntimeConfig.logLevel, 10) : DebugLevel.log;

const {url: node, username, password} = serverRuntimeConfig.elasticSearch;

export const output = (level, message, ...rest) => { // eslint-disable-line
  let _rest;

  if (rest.some(v => v !== undefined))
    _rest = rest;

  const string = `(${level.toUpperCase()}) (${new Date().toISOString()}) ${message}\n`;

  if (LOG_LEVEL && LOG_LEVEL >= +DebugLevel[level])
    console[level](string, _rest ? _rest : ""); // eslint-disable-line

  if (node && username && password) {
    const client = new Client({node, auth: {username, password} })

    client?.index({ index: "web-network-app", document: {level, timestamp: new Date(), message, rest: _rest}})
      .catch(e => console.log(e))
  }
}
/* eslint-disable */
export const info = (message, rest?) => output(Levels.info, message, rest);
export const error = (message, rest?) => output(Levels.error, message, rest);
export const log = (message, rest?) => output(Levels.log, message, rest);