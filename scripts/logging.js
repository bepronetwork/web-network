const {Client} = require("@elastic/elasticsearch");
const {format} = require("date-fns");
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

const LOG_LEVEL = process.env.LOG_LEVEL ? parseInt(process.env.LOG_LEVEL, 10) : DebugLevel.log;

const output = (level, message, ...rest) => { // eslint-disable-line
  let _rest;

  if (rest.some(v => v !== undefined))
    _rest = rest;

  const string = `(${level.toUpperCase()}) (${format(new Date(), `dd/MM HH:mm:ss`)}) ${message}`;

  if (LOG_LEVEL && LOG_LEVEL >= +DebugLevel[level])
    console[level](string, _rest ? _rest : "");

}
/* eslint-disable */
const info = (message, rest) => output(Levels.info, message, rest);
const error = (message, rest) => output(Levels.error, message, rest);
const log = (message, rest) => output(Levels.log, message, rest);
/* eslint-disable */
module.exports = {info, error, log};
