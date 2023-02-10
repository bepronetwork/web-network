import {NextApiHandler, NextApiRequest} from "next";
import {debug, log, Logger} from "../services/logging";

export const LogAccess = (handler: NextApiHandler) => {
  return async (req: NextApiRequest, res) => {
    const {url, method} = req as any;
    const _query = Object.fromEntries(new URLSearchParams(url.split('?')[1]));
    const query = Object.keys(_query).length ? _query : null;
    const body = req?.body || null;

    const pathname = url.split('/api')[1].replace(/\?.+/g, '');

    const rest = (query || body) ? ({ ... query ? {query} : {}, ... body ? {body} : {}}) : '';

    log(`${method} access`, pathname, rest);
    if (rest)
      debug(`${method} access-payload`, pathname, rest);

    try {
      await handler(req, res);
      if (res.error)
        throw Error(res.error);
      if (res.statusCode >= 400)
        Logger.warn(`Answered with ${res.statusCode}`, res.statusMessage, res.body ? JSON.stringify(res.body) : '')

      debug(`${method} access-end`, pathname, rest)
    } catch (e) {
      Logger.error(e, `${method}`, pathname, e?.toString(), rest);
    }
    Logger.changeActionName(``); // clean action just in case;
  }
}