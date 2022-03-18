import formidable from "formidable";
import fs from "fs";
import { NextApiRequest, NextApiResponse } from "next";

import IpfsStorage from "services/ipfs-service";

export const config = {
  api: {
    bodyParser: false
  }
};

async function post(req: NextApiRequest, res: NextApiResponse) {
  const formData = await new Promise<{ fields; files: object }>(
    (resolve, reject) => {
      new formidable.IncomingForm().parse(req, (err, fields, files) => {
        if (err) {
          return reject(err);
        }
        return resolve({ fields, files });
      });
    }
  );
  const values = Object.values(formData.files);
  console.log({ values });
  if (values.length < 1) {
    return res.status(400).json("Undefined files");
  }

  const uploadFiles = [...values].map(
    async (file) =>
      await IpfsStorage.add(
        fs.readFileSync(file.filepath),
        false,
        file.originalFilename
      )
  );
  const files = await Promise.all(uploadFiles).catch((e) => {
    return res.status(403).json(e);
  });

  console.log({ files });

  return res.status(200).json(files);
}

export default async function (req: NextApiRequest, res: NextApiResponse) {
  switch (req.method.toLowerCase()) {
    case "post":
      await post(req, res);
      break;

    default:
      res.status(405).json("Method not allowed");
  }

  res.end();
}
