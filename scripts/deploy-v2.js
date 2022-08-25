const { Web3Connection, ERC20, BountyToken, Network_v2, NetworkRegistry } = require("@taikai/dappkit");
const { exit } = require("process");
const stagingAccounts = require("./staging-accounts")

const usage = `------------------------------------------------------------------------- 
  WebNetwork v2 Smart Contracts Deploy Script 🚀  
-------------------------------------------------------------------------

Usage: $0 -n <network> [-u <rpcUrl> -e <env file> -t <transactional>] 

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
  .option('t', {
    alias: "transactionalTokenAddress",
    describe: "Transactional Address",
    type: 'string',
    nargs: 1,
  })
  .option('g', {
    alias: "networkTokenAddress",
    describe: "Network Token Address",
    type: 'string',
    nargs: 1,
  })
  .option('-r', {
    alias: "rewardTokenAddress",
    describe: "Reward Token Address",
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

  const Deployer = async (_class, args) => {
    const deployer = new _class(web3Connection);
    deployer.loadAbi();
    const tx = deployer.deployJsonAbi(...(args || []));
    return tx;
  }

  const tokens = {
    transactional: {
      name: 'USD Coint',
      symbol: "USDC",
      cap: "300000000000000000000000000"
    },
    network: {
      name: 'Bepro Token',
      symbol: "BEPRO",
      cap: "300000000000000000000000000"
    },
    reward: {
      name: 'Reward Network',
      symbol: "RWD",
      cap: "300000000000000000000000000"
    },
    nft: {
      name: 'Bounty',
      symbol: "~",
    }
  }

  const ownerAddress = argv.ownerAddress || process.env.DEPLOY_OWNER_ADDRESS || await web3Connection.getAddress();

  const getNetworkReceipt = async () =>
    argv.networkTokenAddress || (await Deployer(ERC20, [tokens.network.name, tokens.network.symbol, tokens.network.cap, ownerAddress]))?.contractAddress;
  const getTransactionalReceipt = async () =>
    argv.transactionalTokenAddress || (await Deployer(ERC20, [tokens.transactional.name, tokens.transactional.symbol, tokens.transactional.cap, ownerAddress]))?.contractAddress;
  const getRewardReceipt = async () =>
    argv.rewardTokenAddress || (await Deployer(ERC20, [tokens.reward.name, tokens.reward.symbol, tokens.reward.cap, ownerAddress]))?.contractAddress;

  try {
    // 1. Deploying Contracts
    console.log(`Deploying Contracts...`);
    const networkReceiptAddress = await getNetworkReceipt();
    const transactionalReceiptAddress = await getTransactionalReceipt();
    const rewardReceiptAddress = await getRewardReceipt();

    const nftReceiptAddress = (await Deployer(BountyToken, [tokens.nft.name, tokens.nft.symbol]))?.contractAddress

    // 2. Loading Contracts Instance
    console.log(`Loading Contracts...`);
    const networkToken = new ERC20(web3Connection, networkReceiptAddress);
    const bountyTransactional = new ERC20(web3Connection, transactionalReceiptAddress);
    const rewardToken = new ERC20(web3Connection, rewardReceiptAddress);

    const bountyToken = new BountyToken(web3Connection, nftReceiptAddress);

    await networkToken.loadContract();
    await bountyTransactional.loadContract();
    await rewardToken.loadContract();
    await bountyToken.loadContract();

    // Transfer BEPRO to dev accounts
    if (argv.network !== 'custom' || argv.network !== 'local')
      for (const address of stagingAccounts) {
        console.log(`Transfering 10M BEPRO to ${address}`);
        await bountyTransactional.transferTokenAmount(address, 10000000);
      }


    console.log(`Deploying Network_V2 With Registry...`);
    const registryReceipt = await Deployer(NetworkRegistry, [networkToken.contractAddress, 1000, ownerAddress, 10000]);
    const networkReceipt = await Deployer(Network_v2, [networkToken.contractAddress, registryReceipt.contractAddress]);

    const network = new Network_v2(web3Connection, networkReceipt.contractAddress);
    await network.loadContract();

    console.log(`Changing Network_V2 Settings...`);
    await network.changeDraftTime(60 * 5);//  5 minutes
    await network.changeDisputableTime(60 * 10); // 10 minutes
    await network.changeCouncilAmount(105000); // 105000 Tokens

    //add allowed tokens
    console.log(`Adding Allowed Tokens...`);
    // Reward Tokens
    network.registry.addAllowedTokens([rewardToken.contractAddress]);
    // Transactionals Tokens
    network.registry.addAllowedTokens([bountyTransactional.contractAddress], true);

    console.table({
      NetworkToken: networkToken.contractAddress,
      BountyTransactional: bountyTransactional.contractAddress,
      RewardToken: rewardToken.contractAddress,
      BountyToken: bountyToken.contractAddress,
      Network_v2: network.contractAddress,
      NetworkRegistry: registryReceipt.contractAddress || undefined
    });
  } catch (error) {
    console.error(error);
    exit(1);
  }
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
