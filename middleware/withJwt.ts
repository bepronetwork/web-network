import {getToken} from "next-auth/jwt";
import {Logger} from "../services/logging";
import {INVALID_JWT_TOKEN} from "../helpers/error-messages";
import {NextApiRequest} from "next";

Logger.changeActionName(`WithJWT()`);

const WithJwt = (handler, allowMethods = ['GET']) => {
  return async (req: NextApiRequest, res) => {

    if (allowMethods.map(v => v.toLowerCase()).includes(req.method.toLowerCase()))
      return handler(req, res);

    if (!await getToken({req}))
      return res.status(401).json({message: INVALID_JWT_TOKEN});
  };
};

export default WithJwt;
