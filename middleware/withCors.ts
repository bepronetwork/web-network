import Cors from 'cors'

import { info, error } from 'helpers/api/handle-log';

const cors = Cors({
  methods: ['GET', 'PUT', 'POST'],
  origin: [process.env.NEXT_PUBLIC_HOME_URL || 'http://localhost:3000'],
})

const ignorePaths = ['health'];

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
  const {page = {}, method, url, ip, ua, body} = {...req} as any; // eslint-disable-line
  const pathname = url.split('/api')[1];

  if (!ignorePaths.some(k => pathname.includes(k))){
    const data = {method, ip, ua, pathname, body, ...page}
    e ? error(e, data) : info(data);
  }
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
