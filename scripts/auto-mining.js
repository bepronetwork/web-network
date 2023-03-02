require("dotenv").config();

const { Web3Connection } = require("@taikai/dappkit");

const NAME_REGEX = /\:\/\/(.*?)[., :]/;

function getEnvironmentFromEnv() {
  const env = process.env.NEXT_PUBLIC_API_HOST || "";

  return NAME_REGEX.test(env) ? NAME_REGEX.exec(env)[1] : null;
}

const RPCS = {
  apollodorus: [
    "https://eth-apollodorus.taikai.network:8080"
  ],
  aurelius: [
    "https://eth-aurelius.taikai.network:8080",
    "https://eth-aurelius.taikai.network:8081"
  ],
  afrodite: [
    "https://eth-afrodite.taikai.network:8080"
  ],
  localhost: [
    "http://127.0.0.1:8545",
    "http://127.0.0.1:8546",
  ],
  diogenes: [
    "https://eth-diogenes.taikai.network:8080"
  ],
  irene: [
    "https://eth-irene.taikai.network:8080"
  ],
  iris: [
    "https://eth-iris.taikai.network:8080"
  ],
  seneca: [
    "https://eth-seneca.taikai.network:8080",
  ],
};

async function main () {
  try {
    const name = getEnvironmentFromEnv();

    if (!name) return;
    
    const rpcs = RPCS[name];

    if (!rpcs) return;

    const connections = rpcs.map(web3Host => new Web3Connection({ web3Host }));

    await Promise.all(connections.map(connection => connection.start()));

    await Promise.all(connections.map(async connection => {
      let interval = null;

      interval = setInterval(async () => {
        connection.eth.currentProvider.send({jsonrpc: `2.0`, method: "evm_mine", params: [], id: 0}, () => {});
      }, [1000]);
    }));
  } catch (error) {
    console.log("auto-mining", error?.toString());
  }
}

main();