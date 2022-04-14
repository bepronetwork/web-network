const {
  Web3Connection,
  ERC20,
  toSmartContractDecimals,
  Network
} = require("@taikai/dappkit");

require("dotenv").config();

const cap = toSmartContractDecimals("50000000", 18);

const connection = new Web3Connection({
  web3Host: `${process.env.NEXT_GANACHE_HOST}:${process.env.NEXT_GANACHE_PORT}` || "http://127.0.0.1:7545",
  privateKey: process.env.NEXT_GANACHE_WALLET_PRIVATE_KEY,
  debug: true,
  skipWindowAssignment: true
});

const DeployERC20andNetwork = async (tokenName, tokenSymbol, capital) => {
  if(!process.env.NEXT_GANACHE_WALLET_PRIVATE_KEY) throw Error('Missing Wallet PrivateKey')

  connection.start();

  const deployer = new ERC20(connection);

  deployer.loadAbi();

  const address = await deployer.connection.getAddress();

  deployer
    .deployJsonAbi(tokenName, tokenSymbol, capital, address)
    .then(async (tx) => {
      console.log(`ERC20 Contract Address: ${tx.contractAddress}`);
      const network = new Network(connection);
      network.loadAbi();
      await network
        .deployJsonAbi(tx.contractAddress, tx.contractAddress, address)
        .then((txNetwork) =>
          console.log("Network Contract Address", txNetwork.contractAddress));
    })
    .catch((console.log)).finally(()=> process.exit());
};

const main = async () => {
  await DeployERC20andNetwork("BEPRO", "$BEPRO", cap);
};

main();
