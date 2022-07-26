import Cors from 'cors'

import { info, error } from 'helpers/api/handle-log';

const cors = Cors({
  methods: ['GET', 'PUT', 'POST'],
  origin: [process.env.NEXT_PUBLIC_HOME_URL || 'http://localhost:3000'],
})

const ignoreLogPaths = ['health'];

const runMiddleware = (req, res, fn) =>
  new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error)
        reject(result);
      else resolve(result);
    })
  });

export default function withCors(handler) {
  return async (req, res) =>
    runMiddleware(req, res, cors)
      .then(() => {
        const {page = {}, url, ip, ua, body, method} = req as any;
        const {pathname, search,} = new URL(url);

        if (!ignoreLogPaths.some(k => pathname.includes(k)))
          info('Access', {method, ip, ua, ...page, pathname, search, body});

        return handler(req, res)
      })
      .catch((e) => {
        if (e)
          error(e.message, e);
        res.status(401).json({error: "Unauthorized", reason: "CORS"})
      })
}
