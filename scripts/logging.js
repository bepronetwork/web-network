const {Client} = require("@elastic/elasticsearch");
require('dotenv').config();

const Levels = {log: 'log', info: 'info', error: 'error', DEBUG: 'debug'};

const node = process.env.NEXT_ELASTIC_SEARCH_URL;
const username = process.env.NEXT_ELASTIC_SEARCH_USERNAME;
const password = process.env.NEXT_ELASTIC_SEARCH_PASSWORD;

const output = (level, message, ...rest) => { // eslint-disable-line
  let _rest;

  if (rest.some(v => v !== undefined))
    _rest = rest;

  const string = `(${level.toUpperCase()}) (${new Date().toISOString()}) ${message}\n`;
  console[level](string, _rest ? _rest : "");

  if (node && username && password) {
    const client = new Client({node, auth: {username, password} })

    client?.index({ index: "web-network", document: {level, timestamp: new Date(), message, rest}})
      .catch(e => console.log(e))
  }
}
/* eslint-disable */
const info = (message, rest) => output(Levels.info, message, rest);
const error = (message, rest) => output(Levels.error, message, rest);
const log = (message, rest) => output(Levels.log, message, rest);
/* eslint-disable */
module.exports = {info, error, log};
