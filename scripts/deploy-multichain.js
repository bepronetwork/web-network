const {Sequelize} = require("sequelize");
const yargs = require("yargs");
const {hideBin} = require("yargs/helpers");

const {Network_v2, Web3Connection, NetworkRegistry, ERC20, BountyToken} = require("@taikai/dappkit");
const {nativeZeroAddress} = require("@taikai/dappkit/dist/src/utils/constants");

const DBConfig = require("../db/config");
const ChainModel = require("../db/models/chain.model");
const ChainEvents = require("../db/models/chain-events.model");
const TokensModel = require("../db/models/tokens.model");
const NetworkModel = require("../db/models/network.model");
const NetworkTokensModel = require("../db/models/network-tokens.model");

const StagingAccounts = require('./staging-accounts');

const _xNetwork = (name, rpc, chainTokenName, chainId, chainName, shortName, chainScan, eventsUrl) =>
  ({[name]: {rpc, chainTokenName, chainId, chainName, shortName, chainScan, eventsUrl}})

const _xNetworks = {
  ... _xNetwork(`development`, [`http://localhost:8545`], `TETH`, 1338, `Local Test Chain`, `local`, `http://localhost:8545`, `http://localhost:3334`),
  ... _xNetwork(`seneca`, [`https://eth-seneca.taikai.network:8080`], `TETH`, 1500, `Seneca Test Chain`, `seneca`, `https://eth-seneca.taikai.network:8080`, `https://seneca.taikai.network:2053`),
  ... _xNetwork(`diogenes`, [`https://eth-diogenes.taikai.network:8080`], `TETH`, 1504, `Diogenes Test Chain`, `diogenes`, `https://eth-diogenes.taikai.network:8080`, `https://diogenes.taikai.network:2053`),
  ... _xNetwork(`aurelius`, [`https://eth-aurelius.taikai.network:8080`], `TETH`, 1505, `Aurelius Test Chain`, `aurelius`, `https://eth-aurelius.taikai.network:8080`, `https://aurelius.taikai.network:2053`),
  ... _xNetwork(`afrodite`, [`https://eth-afrodite.taikai.network:8080`], `TETH`, 1501, `Afrodite Test Chain`, `afrodite`, `https://eth-afrodite.taikai.network:8080`, `https://afrodite.taikai.network:2053`),
  ... _xNetwork(`irene`, [`https://eth-irene.taikai.network:8080`], `TETH`, 1502, `Irene Test Chain`, `irene`, `https://eth-irene.taikai.network:8080`, `https://irene.taikai.network:2053`),
  ... _xNetwork(`apollodorus`, [`https://eth-apollodorus.taikai.network:8080`], `TETH`, 1506, `Apollodorus Test Chain`, `apollodorus`, `https://eth-apollodorus.taikai.network:8080`, `https://apollodorus.taikai.network:2053`),
}

const options = yargs(hideBin(process.argv))
  .option(`network`, {alias: `n`, type: `array`, desc: `ids of network to deploy to, as seen on https://chainid.network/ or custom known one`})
  .option(`deployTestTokens`, {alias: `d`, type: `boolean`, desc: `deploys contracts (-d takes precedence over -pgb`})
  .option(`paymentToken`, {alias: `p`, type: `array`, desc: `use these addresses as transactional token`})
  .option(`governanceToken`, {alias: `g`, type: `array`, desc: `use these addresses as governance token`})
  .option(`bountyNFT`, {alias: `b`, type: `array`, desc: `use these addresses as bounty token`})
  .option(`privateKey`, {alias: `k`, type: `string`, desc: `Owner private key`})
  .option(`treasury`, {alias: `t`, type: `string`, desc: `custom treasury address (defaults to owner private key if not provided)`})
  .option(`envFile`, {alias: `e`, type: `array`, desc: `env-file names to load`})
  .demandOption([`n`, `k`])
  .parseSync();

async function main(option = 0) {
  let chainData;

  const isXNetwork = !!_xNetworks[options.network[option]];

  if (isXNetwork)
    chainData = _xNetworks[options.network[option]];
  else chainData =
    await fetch(`https://chainid.network/chains.json`)
      .then(d => d.json())
      .then(data => data.find(d => d.networkId === +options.network[option]));

  if (!chainData) {
    console.log(`Failed to find chainData for ${options.network[option]}; If it's a xNetwork, make sure it exists. If it's an Network ID, make sure if exists on https://chainid.network/chains_mini.json `);
    return;
  }

  const web3Host = chainData.rpc.length > 1 ? chainData.rpc[1] : chainData.rpc[0];
  const env = require('dotenv').config({path: options.envFile[option]}).parsed;
  const privateKey = options.privateKey;

  const {
    DEPLOY_LOCK_AMOUNT_FOR_NETWORK_CREATION = 100,
    DEPLOY_LOCK_FEE_PERCENTAGE = 10000,
    DEPLOY_CLOSE_BOUNTY_FEE = 1000000,
    DEPLOY_CANCEL_BOUNTY_FEE = 2000000,
    DEPLOY_TOKENS_CAP_AMOUNT = "300000000000000000000000000",
    DEPLOY_DRAFT_TIME = 60 * 5, // 5 minutes
    DEPLOY_DISPUTABLE_TIME = 60 * 10, // 10 minutes
    DEPLOY_COUNCIL_AMOUNT = 105000,
    NEXT_PUBLIC_HOME_URL
  } = env;

  const connection = new Web3Connection({web3Host, privateKey});
  connection.start();

  const isDevelopment = options.network[option] === "development";
  const accounts = isDevelopment ? await connection.Web3.eth.getAccounts() : StagingAccounts;

  const treasury = options.treasury ? options.treasury[option] : await connection.getAddress();
  const hasPayment = options.paymentToken ? !!options.paymentToken[option] : false;
  const hasGovernance = options.governanceToken ? !!options.governanceToken[option] : false;
  const hasBountyNFT = options.bountyNFT ? !!options.bountyNFT[option] : false;

  const startBlock = await connection.eth.getBlockNumber();

  function getContractAddress({contractAddress}) {
    return contractAddress;
  }

  async function Deploy(_class, ...args) {
    const deployer = new _class(connection);
    deployer.loadAbi();
    console.debug(`Deploying ${deployer.constructor?.name} with args:`, ...(args || []));
    const address = getContractAddress(await deployer.deployJsonAbi(...(args || [])));
    console.debug(`Deployed address`, address);
    return address;
  }

  async function deployNetwork(governanceToken, registryAddress) {
    return Deploy(Network_v2, governanceToken, registryAddress);
  }

  async function deployRegistry(governanceToken, bountyToken) {
    return Deploy(NetworkRegistry,
                  governanceToken,
                  DEPLOY_LOCK_AMOUNT_FOR_NETWORK_CREATION,
                  treasury,
                  DEPLOY_LOCK_FEE_PERCENTAGE,
                  DEPLOY_CLOSE_BOUNTY_FEE,
                  DEPLOY_CANCEL_BOUNTY_FEE,
                  bountyToken);
  }

  async function deployERC20(name, symbol) {
    return Deploy(ERC20, name, symbol, DEPLOY_TOKENS_CAP_AMOUNT, treasury)
  }

  async function deployBountyToken() {
    return Deploy(BountyToken, `BEPRO Bounty`, `~BEPRO`)
  }

  async function deployTokens() {
    const tokens = [[`Test USDC`, `TUSD`], [`Test BEPRO`, `TBEPRO`], [`Test Reward BEPRO`, `TRBEPRO`]];
    const addresses = [];

    for (const [name, symbol] of tokens) {
      addresses.push(await deployERC20(name, symbol));
    }

    return addresses;
  }

  async function changeNetworkOptions(networkAddress, tokens) {
    console.debug(`Changing network options`);

    const network = new Network_v2(connection, networkAddress);
    await network.loadContract();

    const changeFunctions = [
      [`changeDraftTime`, DEPLOY_DRAFT_TIME],
      [`changeDisputableTime`, DEPLOY_DISPUTABLE_TIME],
      [`changeCouncilAmount`, DEPLOY_COUNCIL_AMOUNT]
    ];

    for (const [fn, value] of changeFunctions) {
      await network[fn](value);
      console.debug(`Changed ${fn} to ${value}`);
    }

    const transactionTokensAllowed = [tokens[1], tokens[0]];
    const rewardTokensAllowed = [tokens[1]];

    if (tokens[2] !== nativeZeroAddress)
      rewardTokensAllowed.push(tokens[2]);

    await network.registry.addAllowedTokens(transactionTokensAllowed, true);
    await network.registry.addAllowedTokens(rewardTokensAllowed, false);

    await network.registry.token.approve(network.registry.contractAddress, DEPLOY_LOCK_AMOUNT_FOR_NETWORK_CREATION);
    await network.registry.lock(DEPLOY_LOCK_AMOUNT_FOR_NETWORK_CREATION);
    await network.registry.registerNetwork(networkAddress);
    await network.registry.bountyToken.setDispatcher(network.registry.contractAddress);

    const nameSymbol = async (_class, address) => {
      const token = new _class(connection, address);
      await token.loadContract();
      return ({name: await token.name(), symbol: await token.symbol()});
    }

    const tokenInfo =
      async (_class, isTransactional, isReward, address) =>
        ({...await nameSymbol(_class, address), isTransactional, isReward, address})

    const result = {
      network: networkAddress,
      registry: network.registry.contractAddress,
      payment: await tokenInfo(ERC20, true, false, tokens[0]),
      governance: await tokenInfo(ERC20, true, true, tokens[1]),
      reward: tokens[2] !== nativeZeroAddress ? await tokenInfo(ERC20, false, true, tokens[2]) : {},
      bounty: {...await nameSymbol(BountyToken, tokens[3]), address: tokens[3]}
    }

    console.debug(`Deploying and Configurations finished`);
    console.debug(JSON.stringify(result, null, 2));

    return result;
  }

  async function saveSettingsToDb({network, registry, payment, governance, reward, bounty}) {
    console.debug("Saving settings to DB");

    const {chainTokenName, chainId, chainName, explorers, eventsUrl, chainScan} = chainData;
    const {NEXT_PUBLIC_DEFAULT_NETWORK_NAME, NEXT_GH_OWNER, NEXT_GH_REPO} = env;

    try {
      const sequelize = new Sequelize(DBConfig.database, DBConfig.username, DBConfig.password, DBConfig);

      NetworkModel.init(sequelize);
      ChainModel.init(sequelize);
      ChainEvents.init(sequelize);
      TokensModel.init(sequelize);
      NetworkTokensModel.init(sequelize);

      const linkScan = explorers?.length ? explorers[0].url : chainScan;
      const blockScanner = linkScan.indexOf("https://") == 0 ? linkScan : `https://bepro.network/`
      const eventsApi = isXNetwork ? eventsUrl : `${NEXT_PUBLIC_HOME_URL}:2096`

      await ChainModel.findOrCreate({
        where: {
          chainId: chainId
        },
        defaults: {
          chainId: chainId,
          chainRpc: web3Host,
          chainName: chainData?.name || chainName,
          chainShortName: chainData?.shortName || chainName,
          chainCurrencyName: chainData?.nativeCurrency?.name || chainTokenName,
          chainCurrencySymbol: chainData?.nativeCurrency?.symbol || chainTokenName,
          chainCurrencyDecimals: chainData?.nativeCurrency?.decimals || 18,
          registryAddress: registry,
          eventsApi: eventsApi,
          blockScanner: blockScanner,
          isDefault: false,
          color: "#29b6af"
        }
      });

      const saveToken = async ({ address, name, symbol, isTransactional, isReward }) => {
        const [token, ] = await TokensModel.findOrCreate({
          where: {
            name,
            symbol,
            isTransactional,
            isReward,
            chain_id: chainId
          },
          defaults: {
            address,
            isAllowed: true,
            isTransactional,
            isReward
          }
        });

        return token;
      };

      const paymentToken = await saveToken(payment);
      const governanceToken = await saveToken(governance);
      const rewardToken = await saveToken(reward);

      if(!NEXT_PUBLIC_DEFAULT_NETWORK_NAME) return;

      const [networkDb] = await NetworkModel.findOrCreate({
        where: {
          name: NEXT_PUBLIC_DEFAULT_NETWORK_NAME
        },
        defaults: {
          networkAddress: network,
          creatorAddress: treasury,
          isDefault: true,
          isRegistered: true,
          description: "Network",
          network_token_id: governanceToken.id,
          chain_id: chainId,
          councilAmount: DEPLOY_COUNCIL_AMOUNT.toString(),
          disputableTime: DEPLOY_DISPUTABLE_TIME,
          draftTime: DEPLOY_DRAFT_TIME,
          oracleExchangeRate: 1,
          mergeCreatorFeeShare: 0.05,
          percentageNeededForDispute: 3,
          cancelableTime: 180 * 86400,
          proposerFeeShare: 10
        }
      });

      await ChainEvents.findOrCreate({
        where: {
          chain_id: chainId,
          name: "global",
          lastBlock: startBlock,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })


      const saveNetworkTokensRelation = async (token, isTransactional, isReward) => {
        await NetworkTokensModel.findOrCreate({
          where: {
            tokenId: token.id,
            networkId: networkDb.id,
          },
          defaults: {
            tokenId: token.id,
            networkId: networkDb.id,
            isTransactional: isTransactional,
            isReward: isReward
          }
        });
      };

      await saveNetworkTokensRelation(paymentToken, payment.isTransactional, payment.isReward);
      await saveNetworkTokensRelation(governanceToken, governance.isTransactional, governance.isReward);
      await saveNetworkTokensRelation(rewardToken, reward.isTransactional, reward.isReward);
    } catch (error) {
      console.debug("Failed to save default network", error);
    }

    console.debug("Saving settings to finished");

    return;
  }

  async function getTokens() {
    if (!options.deployTestTokens) {
      if (!hasGovernance || !hasPayment || !hasBountyNFT)
        throw new Error(`Missing one of (or all): governanceToken, paymentToken, bountyNFT`);

      return [options.paymentToken[option], options.governanceToken[option], nativeZeroAddress, options.bountyNFT[option]];
    }

    const tokens = [...Object.values(await deployTokens()), await deployBountyToken()];

    const mapper = async (address) => {
      const _token = new ERC20(connection, address);
      await _token.loadContract();
      return _token;
    }

    /** Slice the BountyNFT from the saveTokens array and send transfers */
    const [payment, governance, rwd] = await Promise.all(tokens.slice(0, 3).map(mapper));

    for (const address of accounts) {
      try {
        console.debug(`Sending tokens to ${address}...`);
        await payment.transferTokenAmount(address, 10000000);
        await governance.transferTokenAmount(address, 10000000);
        await rwd.transferTokenAmount(address, 10000000);
      } catch (error) {
        console.debug(`Failed to send tokens to ${address}`, error.toString());
      }
    }

    console.debug(`All tokens sent!`);

    return tokens;
  }

  const tokensToUse = await getTokens();

  await saveSettingsToDb( /** grab the result from having changed the network options and save it to db */
    await changeNetworkOptions( /** Load networkAddress and change settings on chain, return result */
      await deployNetwork(tokensToUse[1], /** deploy a network, return contractAddress */
        await deployRegistry(tokensToUse[1], tokensToUse[3])), tokensToUse)); /** Deploy Registry, return contractAddress */
}

(async () => {
  for (let index = 0; index < options.network.length; index++)
    try  {
    await main(index);
    } catch (e) {
      console.error(e);
      process.exit(1);
    }

  process.exit(0);
})();

