const axios = require("axios");
const { v4: uuidv4 } = require("uuid");
const FormData = require("form-data");
const getConfig = require('../../next.config.js');

const { serverRuntimeConfig } = getConfig();

const infuraProjectId = serverRuntimeConfig?.infura?.projectId;
const infuraProjectSecret = serverRuntimeConfig?.infura?.projectSecret;

const auth = "Basic " + Buffer.from(infuraProjectId + ":" + infuraProjectSecret).toString("base64");
const baseURL = serverRuntimeConfig?.infura?.uploadEndPoint || `https://ipfs.infura.io:5001/api/v0`;

/**
 * Send a string to IPFS
 * @param {JSON} content 
 * @param {boolean} pin 
 */
async function sendToIpfs(content, pin = false) {
  const form = new FormData();

  form.append("file", JSON.stringify(content), uuidv4());

  const headers = {
    "Content-Type": `multipart/form-data; boundary=${form.getBoundary()}`,
    Accept: "*/*",
    Connection: "keep-alive",
    authorization: auth
  };

  const { data } = await axios.post(`${baseURL}/add?stream-channels=true&progress=false&pin=${pin}`, form, {
    headers
  });

  return data.Hash;
}

module.exports = {
  sendToIpfs
};