import {Client} from "@elastic/elasticsearch";
import getConfig from "next/config";
import {format} from "date-fns";

const { serverRuntimeConfig } = getConfig();

enum LogLevel {
  none, error, warn, info, trace, log, debug
}

const consoleMethods = {
  none: '',
  log: 'log',
  info: 'info',
  error: 'error',
  DEBUG: 'debug',
  warn: 'warn',
  debug: 'debug',
  trace: 'info'
};

const LOG_LEVEL = serverRuntimeConfig.logLevel ? parseInt(serverRuntimeConfig.logLevel, 10) : LogLevel.debug;
const INDEX_STACK_TRACE = serverRuntimeConfig.logStackTrace;

const {url: node, username, password} = serverRuntimeConfig.elasticSearch;

export const output = (_level: LogLevel, message, ...rest) => { // eslint-disable-line
  const level = LogLevel[_level];
  const method = consoleMethods[level];

  if (!(LOG_LEVEL && LOG_LEVEL >= _level))
    return;

  const string = `(${level.toUpperCase()}) (${format(new Date(), `dd/MM HH:mm:ss`)}) ${message}`;

  console[method](string, ...rest); // eslint-disable-line

  if (node && username && password) {
    if (!INDEX_STACK_TRACE && _level === LogLevel.trace)
      return; // optionally disable indexing stack traces

    const client = new Client({node, auth: {username, password} })

    client?.index({ index: "web-network-app", document: {level, timestamp: new Date(), message, rest}})
      .catch(e => console.log(e))
  }
}
/* eslint-disable */
export const info = (message, ...rest) => output(LogLevel.info, message, ...rest);
export const error = (message, ...rest) => output(LogLevel.error, message, ...rest);
export const log = (message, ...rest) => output(LogLevel.log, message, ...rest);
export const warn = (message, ...rest) => output(LogLevel.warn, message, ...rest);
export const debug = (message, ...rest) => output(LogLevel.debug, message, ...rest);
export const trace = (message, ...rest) => output(LogLevel.trace, message, ...rest);


export class Logger {
  static action: string = ``;
  static changeActionName(action: string) { this.action = action; }

  static _args(...v): [string?, ...any[]] {
    return [
      ... Logger.action ? [Logger.action] : [],
      ...v
    ]
  }

  static info(..._args) { info(...this._args(..._args)) }
  static log(..._args) { log(...this._args(..._args)) }
  static warn(..._args) { warn(...this._args(..._args)) }
  static debug(..._args) { debug(...this._args(..._args)) }
  static trace(..._args) { trace(...this._args(..._args)) }
  static error(e: Error, ..._args) {
    error(...this._args(...[e?.toString(), ..._args]))
    trace(...this._args(...[`Code: ${(e as any).code || `NO_OPCODE`}\n`, e.stack || `NO_STACK_TRACE`, ..._args]));
  }
}