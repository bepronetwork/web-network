import Cors from 'cors'
import getConfig from "next/config";

import {error, info} from 'services/logging';
import {IM_AN_ADMIN, MISSING_ADMIN_SIGNATURE, NOT_AN_ADMIN} from "../helpers/contants";
import {recoverTypedSignature} from "@metamask/eth-sig-util";
import {messageFor} from "../helpers/message-for";

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

    // todo: move this logic to somewhere that it actually makes sense, such as another higher-order-fn

    const headers = req.headers;
    const adminWallet = publicRuntimeConfig?.adminWallet?.toLowerCase();
    const wallet = (headers.wallet as string)?.toLowerCase();

    if (req.method?.toLowerCase !== "get" && !!wallet && wallet === adminWallet) {

      console.log(headers)

      const signature = headers.signature as string;

      if (!signature)
        return res.status(401).write(MISSING_ADMIN_SIGNATURE);

      const params = {
        signature,
        data: JSON.parse(messageFor(IM_AN_ADMIN)),
        version: 'V4'
      }

      if (recoverTypedSignature<any, any>(params)?.toLowerCase() == publicRuntimeConfig.adminWallet.toLowerCase())
        return res.status(401).write(NOT_AN_ADMIN);
    }


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
