const {
  Web3Connection,
  ERC20,
  NetworkFactory,
  Network_v2,
  toSmartContractDecimals
} = require("bepro-js");

const cap = toSmartContractDecimals("50000000", 18);

const connection = new Web3Connection({
  web3Host: "http://127.0.0.1:7545",
  privateKey:
    "b1bfe68577f6fd3b0dab8cd484b5731f6b9979c18f1eb932d44853bff0f66990",
  debug: true,
  skipWindowAssignment: true
});

const DeployERC20 = async (tokenName, tokenSymbol, capital) => {
  const deployer = new ERC20(connection);

  await deployer.loadAbi();

  const address = await deployer.connection.getAddress();

  const tx = await deployer.deployJsonAbi(
    tokenName,
    tokenSymbol,
    capital,
    address
  );

  return tx.contractAddress;
};

const DeployNetwork_v2 = async (settlerAddress, nftAddress, nftUri) => {
  const deployer = new Network_v2(connection);

  await deployer.loadAbi();

  const tx = await deployer.deployJsonAbi(settlerAddress, nftAddress, nftUri);

  return tx.contractAddress;
};

const main = async () => {
  await connection.start();

  const settler = await DeployERC20("Settler", "STL", cap);
  const transactional = await DeployERC20("Transactional", "$TRS", cap);
  const reward = await DeployERC20("Reward", "RWD", cap);
  const nft = await DeployERC20("NFT", "NFT", cap);
  const network = await DeployNetwork_v2(settler, nft, "//");
  //await TokenSummary(SETTLER_TOKEN.name, SETTLER_TOKEN.address);
  //await TokenSummary(NETWORK_TOKEN.name, NETWORK_TOKEN.address);
  //await DeployNetworkFactory();

  console.table({
    settler,
    transactional,
    reward,
    nft,
    network
  });

  const settlerObj = new ERC20(connection, settler);
  const networkObj = new Network_v2(connection, network);

  await settlerObj.loadContract();
  await networkObj.loadContract();

  await settlerObj.approve(networkObj.contractAddress, 1000000);
  await networkObj.lock(205000);
  await networkObj.delegateOracles(5000, "0xF8bF537dFbE9951Ed4E154C8DCD497ae9CfCF08f");
  await networkObj.delegateOracles(5000, "0x56C92b74cD23f41189f44019CCbb809e9754D405");
  console.log(await networkObj.getOraclesOf(await connection.getAddress()));
  console.log(await networkObj.callTx(networkObj.contract.methods.oracles(await connection.getAddress())));
};

main();
