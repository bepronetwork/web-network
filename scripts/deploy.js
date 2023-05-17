const { Web3Connection, ERC20, NetworkFactory, Network } = require("@taikai/dappkit");
const { exit } = require("process");
const stagingAccounts = require("./staging-accounts")

const usage =  `------------------------------------------------------------------------- 
  WebNetwork v1 Smart Contracts Deploy Script 🚀  
-------------------------------------------------------------------------

Usage: $0 -n <network> [-u <rpcUrl> -e <env file>] 

<network> =  development | moonbase | kovan | mainnet | ropsten | seneca | afrodite | custom`

const epilog = 'TAIKAI Copyright 2022'

function showErrorAndHelp(message) {
  return console.error(`
${usage}

💥 Failed: ${message}

${epilog}
`);
}

const argv = require('yargs')
    .alias('e', 'envFile')
    .describe('e', 'Environment file to load')
    .default('e', '.env')
    .option('u', {
      alias: "url",
      describe: "EVM RPC URL",
      type: 'string',
      nargs: 1,
    })  
    .alias('n', 'network')
    .describe('n', 'Ethereum Blockchain')
    .default('n', 'development')
    .choices(["development", "moonbase", "kovan", "mainnet","ropsten", "seneca", "afrodite", "custom"])
    .option('k', {
      alias: "ownerKey",
      describe: "Owner Private key",
      type: 'string',
      nargs: 1,
    })  
    .option('a', {
      alias: "ownerAddress",
      describe: "Owner Eth Address",
      type: 'string',
      nargs: 1,
    })  
    .alias('h', 'help')
    .help('help')
    .usage(usage)
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
  },
  seneca: {
    url: 'https://eth-seneca.taikai.network:8080',
  },
  afrodite: {
    url: 'https://eth-afrodite.taikai.network:8080',
  },
  irene: {
    url: 'https://eth-irene.taikai.network:8080',
  },
  iris: {
    url: 'https://eth-iris.taikai.network:8080',
  },
  diogenes: {
    url: 'https://eth-diogenes.taikai.network:8080',
  },
  aurelius: {
    url: 'https://eth-aurelius.taikai.network:8080',
  },
  aurora: {
    url: 'https://mainnet.aurora.dev',
  },  
  bitgert: {
    url: 'https://mainnet-rpc.brisescan.com',
  },  
  bsc: {
    url: 'https://bscrpc.com',
  },   
}

async function main() {

  const ownerAddress = argv.ownerAddress || process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS;
  const ownerPrivKey = argv.ownerKey || process.env.DEPLOY_PRIVATE_KEY;

  let rpcUrl = "";
  if (argv.network == 'custom') {
    if ( !argv.url ) {
      showErrorAndHelp(`Please provide a valid URL for the custom network`);
      exit(1);
    }    
    rpcUrl = argv.url;
  } else {
    rpcUrl = networks[argv.network].url
  }

  const options = { 
      web3Host: rpcUrl,
      privateKey: ownerPrivKey,
      skipWindowAssignment: true
  };

  // Connect to the RPC Endpoint
  const web3Connection = new Web3Connection(options);
  await web3Connection.start();

  // 1. Deploying Bepro Network 
  console.log(`Deploying Bepro Network on ${argv.network} - ${rpcUrl}`); 
  const erc20Deployer = new ERC20(web3Connection);
  // Load abi contract is only needed for deploy actions
  await erc20Deployer.loadAbi();
  const { contractAddress: beproAddress } = await erc20Deployer.deployJsonAbi(
    "Bepro Network", // the name of the token
    "BEPRO", // the symbol of the token
    "300000000000000000000000000", // 300M
    ownerAddress // the owner of the total amount of the tokens (your address)
  );
  console.log(`Deployed Bepro on ${beproAddress}`);

  // Locking Bepro to create network 

   const beproToken = new ERC20(web3Connection, beproAddress);
   await beproToken.start();

   if(argv.network !== 'custom')
    for(const address of stagingAccounts) {
      console.log(`Transfering 10M BEPRO to ${address}`);
      await beproToken.transferTokenAmount(address, 10000000);
    }

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
  const networkAddress = await factory.getNetworkByAddress(ownerAddress);
  console.log(`Deployed Network on ${networkAddress}`);
  const networkContract = new Network(web3Connection, networkAddress);
  await networkContract.start();
  await networkContract.sendTx(networkContract.contract.methods.claimGovernor());
  console.log(`Setting Redeeem time on ${networkAddress}`);
  // 5min Disputable time
  await networkContract.changeRedeemTime(60*5);
  // 10min Disputable time
  console.log(`Setting Disputable time on ${networkAddress}`);
  await networkContract.changeDisputableTime(60*10);
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
