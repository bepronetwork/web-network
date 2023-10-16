const axios = require("axios");
const formData = require("form-data");
const { v4 } = require("uuid");

const {
  NEXT_IPFS_UPLOAD_ENDPOINT,
  NEXT_IPFS_PROJECT_ID,
  NEXT_IPFS_PROJECT_SECRET,
} = process.env;

async function ipfsAdd(file, pin, ext) {
  const auth =
    "Basic " +
    Buffer.from(NEXT_IPFS_PROJECT_ID + ":" + NEXT_IPFS_PROJECT_SECRET).toString(
      "base64"
    );

  const baseURL =
    NEXT_IPFS_UPLOAD_ENDPOINT || `https://ipfs.infura.io:5001/api/v0`;

  if (!file) return;

  const form = new formData();

  let content = file;

 if (typeof content === "object") {
    form.append("file", JSON.stringify(file), `${v4()}.${ext}`);
 }

  const headers = {
    "Content-Type": `multipart/form-data; boundary=${form.getBoundary()}`,
    Accept: "*/*",
    Connection: "keep-alive",
    authorization: auth,
  };

  const { data } = await axios.post(
    `${baseURL}/add?stream-channels=true&progress=false&pin=${pin}`,
    form,
    {
      headers,
    }
  );
  return { hash: data.Hash, fileName: data.Name, size: data.Size };
}

module.exports = {
  ipfsAdd,
};
