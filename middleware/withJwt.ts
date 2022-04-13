import { getToken } from "next-auth/jwt";

const WithJwt = (handler) => {
  return async (req, res) => {
    const method = req.method
    if(method !== 'GET'){
      const token = await getToken({req});
      if(!token) return res.status(401).write('Unautorized');
    }

    return handler(req, res);
  };
};

export default WithJwt;
