const { Web3Connection, ERC20, NetworkFactory, Network} = require("@taikai/dappkit");

async function main() {
  const ownerPrivKey =  "0x0fe4e394faf4dacd474e085f2d9d9a112eb4f744aa0a859978e7044b7707b1da";
  const ownerPubKey = "0x101759f9E0c627CFa3FFd8Ee6fC51cefE31376A2";
  const options = { 
      web3Host: "http://127.0.0.1:8545",
      privateKey: ownerPrivKey,
      skipWindowAssignment: true
  };
  // Connect to the RPC Endpoint
  const web3Connection = new Web3Connection(options);
  await web3Connection.start();

  // 1. Deploying Bepro Network 
  console.log(`Deploying Bepro Network`); // { ... , contractAddress: string}
  const erc20Deployer = new ERC20(web3Connection);
  // Load abi contract is only needed for deploy actions
  await erc20Deployer.loadAbi();
  const { contractAddress: beproAddress } = await erc20Deployer.deployJsonAbi(
    "Bepro Network", // the name of the token
    "BEPRO", // the symbol of the token
    "100000000000000000000000000", // the total amount of the token (with 18 decimals; 100M = 1000000000000000000000000)
    ownerPubKey // the owner of the total amount of the tokens (your address)
  );
  console.log(`Deployed Bepro on ${beproAddress}`); // { ... , contractAddress: string}

  // Locking Bepro to create network 

   const beproToken = new ERC20(web3Connection, beproAddress);
   await beproToken.start();
  /* const myBalance = await beproToken.getTokenAmount(ownerPubKey);
   console.log(`Balance of ${myBalance}`);*/

  // 2. Deploying Network Proxy
    
  const proxyDeployer = new NetworkFactory(web3Connection);
  await proxyDeployer.loadAbi();
  const { contractAddress: networkFactoryAddress} = await proxyDeployer.deployJsonAbi(beproAddress);
  console.log(`Deployed Network Factory on ${networkFactoryAddress}`); // { ... , contractAddress: string}  
  const factory = new NetworkFactory(web3Connection, networkFactoryAddress);
  await factory.start() // load contract and connection into the class representing your token
  await beproToken.increaseAllowance(networkFactoryAddress, 1000000);
  await factory.lock("1000000");


  // 3. Creating the first network 
  const tx = await factory.createNetwork(beproAddress, beproAddress);
  const network = await factory.getNetworkByAddress(ownerPubKey);
  console.log(`Deployed Network on ${network}`);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
