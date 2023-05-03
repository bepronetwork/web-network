require("dotenv").config();
const { Web3Connection, ERC20, BountyToken, Network_v2, NetworkRegistry } = require("@taikai/dappkit");
const { exit } = require("process");
const stagingAccounts = require("./staging-accounts");
const { updateSetting, updateTokens } = require("./settings/save-from-env");
const Sequelize = require("sequelize");
const DBConfig = require("../db/config");
const NetworkModel = require("../db/models/network.model");
const RepositoryModel = require("../db/models/repositories.model");

const usage = `------------------------------------------------------------------------- 
  WebNetwork v2 Smart Contracts Deploy Script 🚀  
-------------------------------------------------------------------------

Usage: $0 -n <network> [-u <rpcUrl> -e <env file> -t <transactional>] 

<network> =  development | moonbase | kovan | mainnet | ropsten | seneca | afrodite | apolodorus | custom`

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
  .boolean('p')
  .alias('p', 'production')
  .describe('p', 'Is a production environment')
  .default('p', false)
  .alias('n', 'network')
  .describe('n', 'Ethereum Blockchain')
  .default('n', 'development')
  .choices(["development", "moonbase", "kovan", "mainnet", "ropsten", "seneca", "afrodite", "custom", "diogenes","aurelius", "apollodorus"])
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
  .option('f', {
    alias: "treasuryAddress",
    describe: "Treasury Eth Address",
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
  apollodorus: {
    url: 'https://eth-apollodorus.taikai.network:8080'
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
      name: 'Bepro',
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

  const ownerAddress = argv.ownerAddress || process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS || await web3Connection.getAddress();

  const getNetworkReceipt = async () =>
    argv.networkTokenAddress || (await Deployer(ERC20, [tokens.network.name, tokens.network.symbol, tokens.network.cap, ownerAddress]))?.contractAddress;
  const getTransactionalReceipt = async () =>
    argv.transactionalTokenAddress || (await Deployer(ERC20, [tokens.transactional.name, tokens.transactional.symbol, tokens.transactional.cap, ownerAddress]))?.contractAddress;
  const getRewardReceipt = async () =>
    argv.rewardTokenAddress || (await Deployer(ERC20, [tokens.reward.name, tokens.reward.symbol, tokens.reward.cap, ownerAddress]))?.contractAddress;

  try {
    // 1. Deploying Contracts
    console.log(`Address`, web3Connection)
    console.log(`Deploying Contracts...`);
    const networkReceiptAddress = await getNetworkReceipt();
    console.log(`networkToken address`, networkReceiptAddress)
    const transactionalReceiptAddress = await getTransactionalReceipt();
    const rewardReceiptAddress = await getRewardReceipt();

    const nftReceiptAddress = (await Deployer(BountyToken, [tokens.nft.name, tokens.nft.symbol]))?.contractAddress

    // 2. Loading Contracts Instance
    console.log(`Loading Contracts...`);
    
    const networkToken = new ERC20(web3Connection, networkReceiptAddress);
    const bountyTransactional = new ERC20(web3Connection, transactionalReceiptAddress);
    const rewardToken = new ERC20(web3Connection, rewardReceiptAddress);

    const bountyToken = new BountyToken(web3Connection, nftReceiptAddress);

    await networkToken.start();
    await bountyTransactional.start();
    await rewardToken.start();
    await bountyToken.start();

    // Transfer BEPRO to dev accounts
    if ((argv.network !== 'custom' || argv.network !== 'local') && !argv.production)
      for (const address of stagingAccounts) {
        console.log(`Transfering 10M BEPRO to ${address}`);
        await bountyTransactional.transferTokenAmount(address, 10000000);
        await rewardToken.transferTokenAmount(address, 10000000);
        await networkToken.transferTokenAmount(address, 10000000);
      }


    console.log(`Deploying Network_V2 With Registry...`);
    const treasuryAddress = argv.treasuryAddress ? argv.treasuryAddress: ownerAddress;
    const registryReceipt = await Deployer(NetworkRegistry,
      [networkToken.contractAddress, 100, treasuryAddress, 10000, 1000000, 2000000, bountyToken.contractAddress]);
    const networkReceipt = await Deployer(Network_v2, [networkToken.contractAddress, registryReceipt.contractAddress]);

    
    const network = new Network_v2(web3Connection, networkReceipt.contractAddress);
    await network.start();

    console.log(`Changing Network_V2 Settings...`);
    await network.changeDraftTime(60 * 5);//  5 minutes
    await network.changeDisputableTime(60 * 10); // 10 minutes
    await network.changeCouncilAmount(105000); // 105000 Tokens

    //add allowed tokens
    console.log(`Adding Allowed Tokens...`);
    // Tokens
    const transactionTokensAllowed = [networkToken.contractAddress];
    const rewardTokensAllowed = [networkToken.contractAddress];

    if (!transactionTokensAllowed.includes(bountyTransactional.contractAddress))
      transactionTokensAllowed.push(bountyTransactional.contractAddress)
    if (!rewardTokensAllowed.includes(rewardToken.contractAddress))
      rewardTokensAllowed.push(rewardToken.contractAddress)

    await network.registry.addAllowedTokens(transactionTokensAllowed, true);
    await network.registry.addAllowedTokens(rewardTokensAllowed, false);
    await bountyToken.setDispatcher(registryReceipt.contractAddress);
    console.log(`Adding Network_V2 to registry...`)
    await network.registry.token.approve(registryReceipt.contractAddress, 100);
    await network.registry.lock(100)
    await network.registry.registerNetwork(networkReceipt.contractAddress);

    console.table({
      Owner: ownerAddress,
      TreasuryAddress: treasuryAddress,      
      NetworkToken: networkToken.contractAddress,
      BountyTransactional: bountyTransactional.contractAddress,
      RewardToken: rewardToken.contractAddress,
      BountyToken: bountyToken.contractAddress,
      Network_v2: network.contractAddress,
      NetworkRegistry: registryReceipt.contractAddress || undefined
    });

    if (!argv.production) {
      try {
        const sequelize = new Sequelize(DBConfig.database, DBConfig.username, DBConfig.password, DBConfig);
        NetworkModel.init(sequelize);
        RepositoryModel.init(sequelize);
        
        if(!process.env.NEXT_PUBLIC_DEFAULT_NETWORK_NAME) return;
        
        const [networkDb] = await NetworkModel.findOrCreate({
          where: {
            name: process.env.NEXT_PUBLIC_DEFAULT_NETWORK_NAME
          },
          defaults: {
            networkAddress: network.contractAddress,
            creatorAddress: ownerAddress,
            isDefault: true,
            isRegistered: true,
            description: "Network"
          }
        })

        await RepositoryModel.findOrCreate({
          where: {
            githubPath: `${process.env.NEXT_GH_OWNER}/${process.env.NEXT_GH_REPO}`
          },
          defaults: {
            network_id: networkDb.id
          }
        });
      } catch (error) {
        console.log("Failed to save default netwrk", error);
      }
      
      await Promise.all([
        // updateSetting("settlerToken", networkToken.contractAddress, "contracts"),
        // updateSetting("network", network.contractAddress, "contracts"),
        // updateSetting("transactionalToken", networkToken.contractAddress, "contracts"),
        updateSetting("networkRegistry", registryReceipt.contractAddress, "contracts"),
        updateTokens({
          name: await networkToken.name(),
          symbol: await networkToken.symbol(),
          isTransactional: true,
          isReward: true,
          address: networkToken.contractAddress
        }),
        updateTokens({
          name: await rewardToken.name(),
          symbol: await rewardToken.symbol(),
          isTransactional: false,
          isReward: true,
          address: rewardToken.contractAddress
        }),
        updateTokens({
          name: await bountyTransactional.name(),
          symbol: await bountyTransactional.symbol(),
          isTransactional: true,
          isReward: false,
          address: bountyTransactional.contractAddress
        })
      ]);
    } else {
      console.log('Skiping Database Save');
    }
  

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
