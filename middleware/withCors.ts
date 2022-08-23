import Cors from 'cors'

import { info, error } from '@scripts/logging.js';

const cors = Cors({
  methods: ['GET', 'PUT', 'POST'],
  origin: [process.env.NEXT_PUBLIC_HOME_URL || 'http://localhost:3000'],
})

const ignorePaths = ['health', 'ip'];

function runMiddleware(req, res, fn) {
  return new Promise((resolve, reject) => {
    fn(req, res, (result) => {
      if (result instanceof Error) {
        return reject(result)
      }

      return resolve(result)
    })
  })
}

function runLogger(req, e = null) {
  const {page = {}, url, body, method} = req as any;
  const search = Object(new URLSearchParams(url.split('?')[1]));
  const pathname = url.split('/api')[1].replace(/\?.+/g, '');

  if (!ignorePaths.some(k => pathname.includes(k)))
    info('Access', {method, ...page, pathname, search, body});

  if (e)
    error(e?.message, e);
}

const withCors = (handler) => {
  return async (req, res) => {
    runLogger(req);
    runMiddleware(req, res, cors)
    .then(()=>{
      return handler(req, res);
    }).catch((e)=>{
      runLogger(req, e);
      return res.status(401).write('Unautorized');
    })
  };
};

export default withCors;
