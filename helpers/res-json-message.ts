import {NextApiResponse} from "next";

export function resJsonMessage(message: string|string[], res: NextApiResponse, status = 200) {
  return res.status(status).json({message});
}