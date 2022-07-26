import Cors from 'cors'

import { info, error } from 'helpers/api/handle-log';

const cors = Cors({
  methods: ['GET', 'PUT', 'POST'],
  origin: [process.env.NEXT_PUBLIC_HOME_URL || 'http://localhost:3000'],
})

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
      .then(() => handler(req, res))
      .catch(() => res.status(401).json({error: "Unauthorized", reason: "CORS"}))
}
