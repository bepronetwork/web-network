const {Client} = require("@elastic/elasticsearch");
require('dotenv').config();

const Levels = {none: '', log: 'log', info: 'info', error: 'error', DEBUG: 'debug'};

let DebugLevel;
(function (DebugLevel) {
  DebugLevel[DebugLevel["none"] = 0] = "none";
  DebugLevel[DebugLevel["error"] = 1] = "error";
  DebugLevel[DebugLevel["warn"] = 2] = "warn";
  DebugLevel[DebugLevel["info"] = 3] = "info";
  DebugLevel[DebugLevel["log"] = 4] = "log";
})(DebugLevel || (DebugLevel = {}))

const node = process.env.NEXT_ELASTIC_SEARCH_URL;
const username = process.env.NEXT_ELASTIC_SEARCH_USERNAME;
const password = process.env.NEXT_ELASTIC_SEARCH_PASSWORD;

const LOG_LEVEL = process.env.LOG_LEVEL ? parseInt(process.env.LOG_LEVEL, 10) : DebugLevel.log;

const output = (level, message, ...rest) => { // eslint-disable-line
  let _rest;

  if (rest.some(v => v !== undefined))
    _rest = rest;

  const string = `(${level.toUpperCase()}) (${new Date().toISOString()}) ${message}\n`;

  if (LOG_LEVEL && LOG_LEVEL >= +DebugLevel[level])
    console[level](string, _rest ? _rest : "");

  if (node && username && password) {
    const client = new Client({node, auth: {username, password} })

    client?.index({ index: "web-network", document: {level, timestamp: new Date(), message, rest: _rest}})
      .catch(e => console.log(e))
  }
}
/* eslint-disable */
const info = (message, rest) => output(Levels.info, message, rest);
const error = (message, rest) => output(Levels.error, message, rest);
const log = (message, rest) => output(Levels.log, message, rest);
/* eslint-disable */
module.exports = {info, error, log};
