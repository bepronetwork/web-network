const { Web3Connection, ERC20, NetworkFactory, Network } = require("@taikai/dappkit");

const argv = require('yargs')
    .alias('e', 'envFile')
    .describe('e', 'Environment file to load')
    .default('e', '.env')
    .alias('n', 'network')
    .describe('n', 'Ethereum Blockchain')
    .default('n', 'development')
    .alias('h', 'help')
    .help('help')
    .usage('Usage: $0 [options] <file>')
    .showHelpOnFail(false, 'Specify --help for available options')
    .epilog('TAIKAI Copyright 2022').argv;

require('dotenv').config({ path: argv.envFile });

const networks = {
  development: {
    url: 'http://127.0.0.1:8545/',
  }, 
  moonbase: {
    url: 'https://rpc.api.moonbase.moonbeam.network',
  },
  moonbeam: {
    url: 'https://rpc.api.moonbeam.network',
  },    
  kovan: {
    url: `https://kovan.infura.io/v3/${process.env.DEPLOY_INFURA_KEY}`
  },
  mainnet: {
    url: `https://mainnet.infura.io/v3/${process.env.DEPLOY_INFURA_KEY}`
  },
  ropsten: {
    url: `https://ropsten.infura.io/v3/${process.env.DEPLOY_INFURA_KEY}`
  }
}

async function main() {

  const ownerAddress = process.env.DEPLOY_OWNER_ADDRESS;
  const ownerPrivKey = process.env.DEPLOY_PRIVATE_KEY;
  const options = { 
      web3Host: networks[argv.network].url,
      privateKey: ownerPrivKey,
      skipWindowAssignment: true
  };

  // Connect to the RPC Endpoint
  const web3Connection = new Web3Connection(options);
  await web3Connection.start();

  // 1. Deploying Bepro Network 
  console.log(`Deploying Bepro Network on ${argv.network}`); 
  const erc20Deployer = new ERC20(web3Connection);
  // Load abi contract is only needed for deploy actions
  await erc20Deployer.loadAbi();
  const { contractAddress: beproAddress } = await erc20Deployer.deployJsonAbi(
    "Bepro Network", // the name of the token
    "BEPRO", // the symbol of the token
    "100000000000000000000000000",
    ownerAddress // the owner of the total amount of the tokens (your address)
  );
  console.log(`Deployed Bepro on ${beproAddress}`);

  // Locking Bepro to create network 

   const beproToken = new ERC20(web3Connection, beproAddress);
   await beproToken.start();

  // 2. Deploying Network Proxy
    
  const proxyDeployer = new NetworkFactory(web3Connection);
  await proxyDeployer.loadAbi();
  const { contractAddress: networkFactoryAddress} = await proxyDeployer.deployJsonAbi(beproAddress);
  console.log(`Deployed Network Factory on ${networkFactoryAddress}`); 
  const factory = new NetworkFactory(web3Connection, networkFactoryAddress);
  await factory.start()
  await beproToken.increaseAllowance(networkFactoryAddress, 1000000);
  await factory.lock("1000000");


  // 3. Creating the first network 
  const tx = await factory.createNetwork(beproAddress, beproAddress);
  const network = await factory.getNetworkByAddress(ownerAddress);
  console.log(`Deployed Network on ${network}`);

}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
