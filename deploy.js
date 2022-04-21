const {
  Web3Connection,
  ERC20,
  NetworkFactory,
  BountyToken,
  Network_v2,
  NetworkFactoryV2,
  toSmartContractDecimals
} = require("@taikai/dappkit");

const cap = toSmartContractDecimals("50000000", 18);

const connection = new Web3Connection({
  web3Host: "HTTP://127.0.0.1:7545",
  privateKey:
    "312331afc7aa764117a4b62fa832e4cf8508f6213aaca2b2d52f8ee37170701e",
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

const DeployBountyToken = async (tokenName, tokenSymbol) => {
  const deployer = new BountyToken(connection);

  await deployer.loadAbi();

  const address = await deployer.connection.getAddress();

  const tx = await deployer.deployJsonAbi(
    tokenName,
    tokenSymbol
  );

  return tx.contractAddress;
};

const DeployNetwork_v2 = async (settlerAddress, nftAddress, nftUri) => {
  const deployer = new Network_v2(connection);

  await deployer.loadAbi();

  const tx = await deployer.deployJsonAbi(settlerAddress, nftAddress, nftUri);

  return tx.contractAddress;
};

const DeployNetworkFactoryV2 = async (settlerToken) => {
  const deployer = new NetworkFactoryV2(connection);

  await deployer.loadAbi();

  const tx = await deployer.deployJsonAbi(settlerToken);

  return tx.contractAddress;
}

const main = async () => {
  await connection.start();

  console.log(await DeployNetworkFactoryV2("0xc8bA18BD582499a1F5480b668aBFf4b7384db08d"));

  // const settler = await DeployERC20("Settler", "STL", cap);
  // const transactional = await DeployERC20("Transactional", "TRS", cap);
  // const reward = await DeployERC20("Reward", "RWD", cap);
  // const bountyToken = await DeployBountyToken("NFT", "NFT");
  // const network = await DeployNetwork_v2(settler, bountyToken, "//");
  // await TokenSummary(SETTLER_TOKEN.name, SETTLER_TOKEN.address);
  // await TokenSummary(NETWORK_TOKEN.name, NETWORK_TOKEN.address);
  // await DeployNetworkFactory();

  // const settlerObj = new ERC20(connection, settler);
  // const nftObj = new BountyToken(connection, bountyToken);
  // const transactionalObj = new ERC20(connection, transactional);
  // const networkObj = new Network_v2(connection, network);

  // await settlerObj.loadContract();
  // await networkObj.loadContract();
  // await nftObj.loadContract();
  // await transactionalObj.loadContract();

  // await settlerObj.approve(network, 1000000);
  // await transactionalObj.approve(network, 1000000);
  // await nftObj.setDispatcher(network);

  // await networkObj.changeDraftTime(61);
  // await networkObj.changeDisputableTime(61);
  // await networkObj.changeCouncilAmount(102000);

  // return console.table({
  //   settler,
  //   transactional,
  //   reward,
  //   bountyToken,
  //   network
  // });

  // await settlerObj.approve(networkObj.contractAddress, 1000000);
  // await networkObj.lock(205000);
  // await networkObj.delegateOracles(5000, "0xF8bF537dFbE9951Ed4E154C8DCD497ae9CfCF08f");
  // await networkObj.delegateOracles(5000, "0x56C92b74cD23f41189f44019CCbb809e9754D405");
  // console.log(await networkObj.getOraclesOf(await connection.getAddress()));
  // console.log(await networkObj.callTx(networkObj.contract.methods.oracles(await connection.getAddress())));


};

main();
