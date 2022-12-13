import {recoverTypedSignature} from "@metamask/eth-sig-util";
import Cors from 'cors'
import getConfig from "next/config";

import {IM_AN_ADMIN, MISSING_ADMIN_SIGNATURE, NOT_AN_ADMIN} from "../helpers/contants";
import {messageFor} from "../helpers/message-for";

const { publicRuntimeConfig } = getConfig();

const cors = Cors({
  methods: ['GET', 'PUT', 'POST', 'PATCH', 'DELETE'],
  origin: [publicRuntimeConfig?.urls?.home || 'http://localhost:3000'],
});


const WithCors = (handler) =>
  (req, res) =>
    new Promise((resolve, reject) => {

      const next = (e) => {
        if (e instanceof Error)
          reject(e);
        resolve(null)
      }

      cors(req, res, next);

    }).then(() => handler(req, res))


export default WithCors;
