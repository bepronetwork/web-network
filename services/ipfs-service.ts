import axios from "axios";
import { fileTypeFromBuffer } from "file-type";
import FormData from "form-data";
import { v4 as uuidv4 } from "uuid";
const host = process.env.NEXT_IPFS_HOST || "ipfs.infura.io";
const port = process.env.NEXT_IPFS_PORT || "5001";
const auth =
  "Basic " +
  Buffer.from(process.env.NEXT_IPFS_PROJECT_ID +
      ":" +
      process.env.NEXT_IPFS_PROJECT_SECRET).toString("base64");
const baseURL = `https://${host}:${port}/api/v0`;

export async function add(file: Buffer | string,
                          pin = false,
                          originalFilename?: string,
                          ext?: string): Promise<{ hash: string; fileName: string; size: string }> {
  const form = new FormData();

  const isBuffer = Buffer.isBuffer(file);

  const content = isBuffer ? Buffer.from(file) : file;

  if (isBuffer) {
    const fileType = await fileTypeFromBuffer(file);

    const options = {
      filename: originalFilename
        ? `${originalFilename}`
        : `${uuidv4()}.${fileType.ext || "png"}`,
      contentType: fileType?.mime || "image/jpeg"
    };

    console.log({ isBuffer, fileType, options });

    form.append("file", content, options);
  } else {
    form.append("file", content, `${uuidv4()}.${ext}`);
  }

  const headers = {
    "Content-Type": `multipart/form-data; boundary=${form.getBoundary()}`,
    Accept: "*/*",
    Connection: "keep-alive",
    authorization: auth
  };

  const { data } = await axios.post(`${baseURL}/add?stream-channels=true&progress=false&pin=${pin}`,
                                    form,
                                    {
      headers
                                    });
  console.log({ data });
  return { hash: data.Hash, fileName: data.Name, size: data.Size };
}

export async function addAll(files: Buffer[]): Promise<{ hash: string; fileName: string; size: string }> {
  if (files.length < 1) {
    throw new Error("Unidentified files");
  }

  const form = new FormData();

  files?.forEach(async (file, index) => {
    const content = Buffer.from(file);
    const fileType = await fileTypeFromBuffer(file);
    const options = {
      filename: `${uuidv4()}.${fileType.ext || "png"}`,
      contentType: fileType?.mime || "image/jpeg"
    };
    form.append(`file-${index}`, content, options);
  });

  const headers = {
    "Content-Type": "application/x-directory",
    Accept: "*/*",
    Connection: "keep-alive",
    authorization: auth
  };

  const { data } = await axios.post(`${baseURL}/add?wrap-with-directory=true&only-hash=true`,
                                    form,
                                    {
      headers
                                    });

  return { hash: data.Hash, fileName: data.Name, size: data.Size };
}

export default { add, addAll };
