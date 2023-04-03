const { Network_v2, Web3Connection, NetworkRegistry } = require("@taikai/dappkit");


async function loadContract(contractClass, web3Connection, contractAddress) {
  const contract = new contractClass(web3Connection, contractAddress);

  await contract.loadContract();

  return contract;
}

async function loadNetworkV2(web3Connection, networkAddress) {
  return loadContract(Network_v2, web3Connection, networkAddress);
}

async function loadNetworkRegistry(web3Connection, networkAddress) {
  return loadContract(NetworkRegistry, web3Connection, networkAddress);
}

async function getDAO({
  web3Host,
  networkAddress = null,
  registryAddress = null
}) {
  const web3Connection = new Web3Connection({
    skipWindowAssignment: true,
    web3Host: web3Host,
  });

  await web3Connection.start();

  const networkV2 = networkAddress ? await loadNetworkV2(web3Connection, networkAddress) : null;

  const networkRegistry = registryAddress ? await loadNetworkRegistry(web3Connection, registryAddress) : null;

  return {
    web3Connection,
    networkV2,
    networkRegistry
  };
}

module.exports = {
  getDAO,
  loadNetworkV2,
  loadNetworkRegistry
};