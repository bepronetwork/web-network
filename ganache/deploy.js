const {
  Web3Connection,
  ERC20,
  toSmartContractDecimals,
  Network,
} = require("bepro-js");

const cap = toSmartContractDecimals("50000000", 18);

const connection = new Web3Connection({
  web3Host: "http://127.0.0.1:7545",
  privateKey:
    "6dee9544733125f879bdf1f5c51638d0dbaceb579e15c49ac52348d39019b9ab",
  debug: true,
  skipWindowAssignment: true,
});

const DeployERC20andNetwork = async (tokenName, tokenSymbol, capital) => {
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
          console.log("Network Contract Address", txNetwork.contractAddress)
        );
    })
    .catch(console.log);
};

const main = async () => {
  await DeployERC20andNetwork("BEPRO", "$BEPRO", cap);
};

main();
