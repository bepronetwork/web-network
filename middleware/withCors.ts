import Cors from 'cors'
import getConfig from "next/config";

import {error, info} from 'services/logging';

const { publicRuntimeConfig } = getConfig();

const cors = Cors({
  methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'],
  origin: [publicRuntimeConfig?.urls?.home || 'http://localhost:3000'],
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
  const {url, method} = req as any;
  const search = Object(new URLSearchParams(url.split('?')[1]));
  const pathname = url.split('/api')[1].replace(/\?.+/g, '');

  if (!ignorePaths.some(k => pathname.includes(k)))
    info('Access', {method, pathname, search,});

  if (e)
    error(`Access`, {method, pathname, error: e});
}

const withCors = (handler) => {
  return async (req, res) => {
    runLogger(req);
    return runMiddleware(req, res, cors)
    .then(()=>{
      return handler(req, res);
    }).catch((e)=>{
      runLogger(req, e?.message || e.toString());
      return res.status(401).write('Unautorized');
    })
  };
};

export default withCors;
