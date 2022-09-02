const {
  Web3Connection,
  ERC20,
  BountyToken,
  Network_v2,
  NetworkFactoryV2,
  toSmartContractDecimals,
  Network_Registry
} = require("@taikai/dappkit");
const { nativeZeroAddress } = require("@taikai/dappkit/dist/src/utils/constants");
const fs = require("fs");

const cap = toSmartContractDecimals("50000000", 18);

const connection = new Web3Connection({
  web3Host: "http://127.0.0.1:8545",
  privateKey:
    "0x40a674d5327e433ccb291408db12e890a806bfa49916e2fd948770b246d6a871",
  debug: false,
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

const DeployNetworkRegistry = async (token) => {
  const deployer = new Network_Registry(connection);

  await deployer.loadAbi();

  const tx = await deployer.deployJsonAbi(token, 1000000, await connection.getAddress(), 10000);

  return tx.contractAddress;
}

const InitialDeploy = async () => {
  await connection.start();

  console.log("Deploying contracts...");
  const settlerAddress = await DeployERC20("Bepro Network", "BEPRO", cap);
  const transactionalAddress = await DeployERC20("USD Coin", "USDC", cap);
  const rewardAddress = await DeployERC20("MVLS Network", "MVLS", cap);
  const bountyTokenAddress = await DeployBountyToken("NFT Token", "NFT");
  const networkAddress = await DeployNetwork_v2(settlerAddress, bountyTokenAddress, "//");
  const registryAddress = await DeployNetworkRegistry(settlerAddress);
  console.log("Done.");

  const settler = new ERC20(connection, settlerAddress);
  const bountyToken = new BountyToken(connection, bountyTokenAddress);
  const transactional = new ERC20(connection, transactionalAddress);
  const reward = new ERC20(connection, rewardAddress);
  const registry = new Network_Registry(connection, registryAddress);

  await settler.loadContract();
  await bountyToken.loadContract();
  await transactional.loadContract();
  await reward.loadContract();
  await registry.loadContract();

  console.log("Registering Network...");
  // Approve, lock and create a new network using the factory
  await settler.approve(registryAddress, 1000000);
  await registry.lock(1000000);
  await registry.registerNetwork(networkAddress);
  console.log("Done.");

  const networkObj = new Network_v2(connection, networkAddress);

  await networkObj.loadContract();

  console.log("Setting dispatcher...");
  await bountyToken.setDispatcher(networkAddress);
  console.log("Done.");

  console.log("Changing parameters...");
  await networkObj.changeDraftTime(61);
  await networkObj.changeDisputableTime(120);
  await networkObj.changeCouncilAmount(101000);
  console.log("Done.");

  const address1 = "0xf3ad222f9Aa841C240022b73cA228A71a92fF82D";
  const address2 = "0xC3869b5a2D0EA422a007a2503C0d616C6a8d6B63";
//0x2df37e0a6fb120ba6f73ced70cc6fc05e271117fd37bf91ebf8f2d41337e88ba
//0xee25838257227fbf30605198ddb54161a99f310c573e9374dbe370aa3be98fce
  console.log("Transfering amounts...");
  await settler.transferTokenAmount(address1, 10000000);
  await settler.transferTokenAmount(address2, 10000000);

  await transactional.transferTokenAmount(address1, 10000000);
  await transactional.transferTokenAmount(address2, 10000000);

  await reward.transferTokenAmount(address1, 10000000);
  await reward.transferTokenAmount(address2, 10000000);
  console.log("Done.");

  console.table({
    Settler: settlerAddress,
    Transactional: transactionalAddress,
    Reward: rewardAddress,
    BountyToken: bountyTokenAddress,
    Network_v2: networkAddress,
    Network_Registry: registryAddress
  });

  let addresses = `Network_Registry: ${registryAddress}\n`;
  addresses += `Network_v2:       ${networkAddress}\n`;
  addresses += `Settler:          ${settlerAddress}\n`;
  addresses += `Transactional:    ${transactionalAddress}\n`;
  addresses += `BountyToken:      ${bountyTokenAddress}\n`;
  addresses += `Reward:           ${rewardAddress}\n`;

  fs.writeFile("./.scripts/addresses.txt", addresses, () => {});
};

InitialDeploy();
