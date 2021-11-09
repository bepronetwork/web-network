import {NextApiRequest, NextApiResponse} from 'next';
import axios from 'axios';

async function get(req: NextApiRequest, res: NextApiResponse) {
  const ip = req.headers['x-forwarded-for'] || req.connection?.remoteAddress;
  const response = await axios.get(`https://pro.ip-api.com/json/${ip}?key=${process.env.IP_API_KEY}&fields=status,message,countryCode,country`)
                              .catch(error => {
                                return error.response;
                              });
  return res.status(response.status).json(response.data)
}

export default async function GetIp(req: NextApiRequest, res: NextApiResponse) {

  switch (req.method.toLowerCase()) {
    case 'get':
      await get(req, res);
      break;

    default:
      res.status(405).json(`Method not allowed`);
  }

  res.end();
}
