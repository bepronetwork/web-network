const { Web3Connection, ERC20, BountyToken, Network_v2, Network_Registry } = require("@taikai/dappkit");
const { exit } = require("process");
const stagingAccounts = require("./staging-accounts")

const usage = `------------------------------------------------------------------------- 
  WebNetwork v2 Smart Contracts Deploy Script 🚀  
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
  .choices(["development", "moonbase", "kovan", "mainnet", "ropsten", "seneca", "afrodite", "custom"])
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
  }
}


async function main() {

  const ownerAddress = argv.ownerAddress || process.env.DEPLOY_OWNER_ADDRESS;
  const ownerPrivKey = argv.ownerKey || process.env.DEPLOY_PRIVATE_KEY;

  let rpcUrl = "";
  if (argv.network == 'custom') {
    if (!argv.url) {
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


  const DeployERC20 = async (tokenName, tokenSymbol, capital) => {
    const deployer = new ERC20(web3Connection);

    // Load abi contract is only needed for deploy actions
    await deployer.loadAbi();

    const tx = await deployer.deployJsonAbi(
      tokenName, // the name of the token
      tokenSymbol, // the symbol of the token
      capital, // capital
      ownerAddress // the owner of the total amount of the tokens (your address)
    );
    
    console.log(`Deployed ${tokenName} - ${tokenSymbol} at ${tx.contractAddress}`)
    return tx.contractAddress;
  };

  const DeployBountyToken = async (tokenName, tokenSymbol) => {
    const deployer = new BountyToken(web3Connection);

    await deployer.loadAbi();

    const tx = await deployer.deployJsonAbi(
      tokenName,
      tokenSymbol
    );
    console.log(`Deployed ${tokenName} - ${tokenSymbol} at ${tx.contractAddress}`)
    return tx.contractAddress;
  };

  const DeployNetwork_v2 = async (settlerAddress, nftAddress, nftUri) => {
    const deployer = new Network_v2(web3Connection);

    await deployer.loadAbi();

    const tx = await deployer.deployJsonAbi(settlerAddress, nftAddress, nftUri);

    console.log(`Deployed Network_V2 at ${tx.contractAddress}`)
    return tx.contractAddress;
  };

  const DeployNetworkRegistry = async (token) => {
    const deployer = new Network_Registry(web3Connection);

    await deployer.loadAbi();

    const tx = await deployer.deployJsonAbi(token, 1000000, await web3Connection.getAddress(), 10000);

    console.log(`Deployed Network_Registry at ${tx.contractAddress}`)

    return tx.contractAddress;
  }

  // 1. Deploying Contracts
  console.log(`Deploying Contracts...`);
  const settlerAddress = await DeployERC20("Bepro Network", "BEPRO", "300000000000000000000000000");
  const transactionalAddress = await DeployERC20("USD Coin", "USDC", "500000000000000000000000");
  const rewardAddress = await DeployERC20("Reward Network", "RWD", "500000000000000000000000");
  const bountyTokenAddress = await DeployBountyToken("NFT Token", "NFT");
  const networkAddress = await DeployNetwork_v2(settlerAddress, bountyTokenAddress, "//");
  const registryAddress = await DeployNetworkRegistry(settlerAddress);

  // 2. Instancing Contract
  console.log(`Loading Contracts...`);
  const settler = new ERC20(web3Connection, settlerAddress);
  const bountyToken = new BountyToken(web3Connection, bountyTokenAddress);
  const transactional = new ERC20(web3Connection, transactionalAddress);
  const reward = new ERC20(web3Connection, rewardAddress);
  const registry = new Network_Registry(web3Connection, registryAddress);
  const networkContract = new Network_v2(web3Connection, networkAddress);

  await settler.loadContract();
  await bountyToken.loadContract();
  await transactional.loadContract();
  await reward.loadContract();
  await registry.loadContract();
  await networkContract.loadContract();

  // Transfer BEPRO to dev accounts
  if (argv.network !== 'custom' || argv.network !== 'local')
    for (const address of stagingAccounts) {
      console.log(`Transfering 10M BEPRO to ${address}`);
      await settler.transferTokenAmount(address, 10000000);
    }
  
  // 4. Approve, lock and create a new network using the factory
  await settler.approve(registryAddress, 1000000);
  await registry.lock(1000000);
  await registry.registerNetwork(networkAddress);
  await bountyToken.setDispatcher(networkAddress);

  // // 5. Configure basic network Parameters
  console.log(`Setting Redeeem time on ${networkAddress}`);
  // 5min Disputable time
  await networkContract.changeDraftTime(60*5);
  // 10min Disputable time
  console.log(`Setting Disputable time on ${networkAddress}`);
  await networkContract.changeDisputableTime(60*10);
  console.log(`Setting Council Ammount on ${networkAddress}`);
  await networkContract.changeCouncilAmount(1000000);

  console.table({
    Settler: settlerAddress,
    Transactional: transactionalAddress,
    Reward: rewardAddress,
    BountyToken: bountyTokenAddress,
    Network_v2: networkAddress,
    Network_Registry: registryAddress
  });
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
