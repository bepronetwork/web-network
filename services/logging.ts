import Scribal from "./scribal";

/* eslint-disable */
export const info = (message: string, ...rest) => Scribal.i(message, ...rest);
export const error = (message: string, ...rest) => Scribal.e(message, ...rest);
export const log = (message: string, ...rest) => Scribal.d(message, ...rest);
export const warn = (message: string, ...rest) => Scribal.w(message, ...rest);
export const debug = (message: string, ...rest) => Scribal.d(message, ...rest);
export const trace = (message: string, ...rest) => Scribal.d(message, ...rest);


export class Logger {
  static action: string = ``;
  static changeActionName(action: string) { this.action = action; }

  static _args(...v): [string?, ...any[]] {
    return [
      ... Logger.action ? [Logger.action] : [],
      ...v
    ]
  }

  static info(message,..._args) { info(...this._args(message,..._args)) }
  static log(message,..._args) { log(...this._args(message,..._args)) }
  static warn(message,..._args) { warn(...this._args(message,..._args)) }
  static debug(message,..._args) { debug(...this._args(message,..._args)) }
  static trace(message,..._args) { trace(...this._args(message,..._args)) }
  static error(e: Error, message, ..._args) {
    error(message, ...this._args(...[e?.toString(), ..._args]))
    trace(`Code: ${(e as any).code || `NO_OPCODE`}\n`, e.stack || `NO_STACK_TRACE`);
  }
}