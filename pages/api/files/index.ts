import formidable from "formidable";
import fs from "fs";
import {NextApiRequest, NextApiResponse} from "next";

import { withProtected } from "middleware";

import IpfsStorage from "services/ipfs-service";
import {Logger} from "services/logging";

export const config = {
  api: {
    bodyParser: false
  }
};

async function post(req: NextApiRequest, res: NextApiResponse) {
  const formData = await new Promise<{ fields; files: object }>((resolve, reject) => {
    new formidable.IncomingForm().parse(req, (err, fields, files) => {
      if (err) {
        return reject(err);
      }
      return resolve({ fields, files });
    });
  });
  const values = Object.values(formData.files);

  if (values.length < 1) {
    return res.status(400).json("Undefined files");
  }

  const uploadFiles = [...values].map(async (file) =>
       IpfsStorage.add(fs.readFileSync(file.filepath),
                       false,
                       file.originalFilename));
  const files = await Promise.all(uploadFiles).catch((e) => {
    return res.status(403).json(e);
  });
  return res.status(200).json(files);
}

async function FilesMethods (req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
  case "post":
    await post(req, res);
    break;

  default:
    res.status(405).json("Method not allowed");
  }

  res.end();
}

Logger.changeActionName(`Files`);
export default withProtected(FilesMethods);
