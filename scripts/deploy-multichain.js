const yargs = require("yargs");
const {hideBin} = require("yargs/helpers");
const StagingAccounts = require('./staging-accounts');

const {Network_v2, Web3Connection, NetworkRegistry, ERC20, BountyToken} = require("@taikai/dappkit");
const {nativeZeroAddress} = require("@taikai/dappkit/dist/src/utils/constants");

const xNetworks = {
  seneca: 'https://eth-seneca.taikai.network:8080',
  diogenes: 'https://eth-diogenes.taikai.network:8080',
  aurelius: 'https://eth-aurelius.taikai.network:8080',
  afrodite: 'https://eth-afrodite.taikai.network:8080',
  irene: 'https://eth-irene.taikai.network:8080',
  apollodorus: 'https://eth-apollodorus.taikai.network:8080',
}

const DEPLOY_DRAFT_TIME = 60 * 5;
const DEPLOY_DISPUTABLE_TIME = 60 * 5;
const DEPLOY_COUNCIL_AMOUNT = 1;
const DEPLOY_LOCK_AMOUNT_FOR_NETWORK_CREATION = 1;
const DEPLOY_LOCK_FEE_PERCENTAGE = 1;
const DEPLOY_CLOSE_BOUNTY_FEE = 1;
const DEPLOY_TOKENS_CAP_AMOUNT = 100000;

const options = yargs(hideBin(process.argv))
  .option(`network`, {alias: `n`, type: `array`, desc: `ids of network to deploy to, as seen on https://chainid.network/ or custom known one`})
  .option(`deployTestTokens`, {alias: `d`, type: `boolean`, desc: `deploys contracts (-d takes precedence over -pgb`})
  .option(`paymentToken`, {alias: `p`, type: `array`, desc: `use this address as transactional token`})
  .option(`governanceToken`, {alias: `g`, type: `array`, desc: `use this address as governance token`})
  .option(`bountyNFT`, {alias: `b`, type: `array`, desc: `use this address as bounty token`})
  .option(`privateKey`, {alias: `k`, type: `array`, desc: `Owner private key`})
  .option(`treasury`, {alias: `t`, type: `array`, desc: `custom treasury address (defaults to owner private key if not provided)`})
  .option(`envFile`, {alias: `e`, type: `array`, desc: `env-file names to load`})
  .demandOption([`n`, `k`])
  .parseSync();

async function main(option = 0) {
  const web3Host =
    xNetworks[options.network[option]] ||
    await fetch(`https://chainid.network/chains_mini.json`)
      .then(d => d.json())
      .then(data => data.find(d => d.networkId === +options.network[option]))
      .then(chain => chain.rpc[0]);

  const connection = new Web3Connection({web3Host, privateKey: options.privateKey[option]});
  connection.start();

  const treasury = options.treasury || await connection.getAddress();
  const should_deployTokens = options.deployTestTokens[option];
  const hasPayment = !!options.paymentToken[option];
  const hasGovernance = !!options.governanceToken[option];
  const hasBountyNFT = !!options.bountyNFT[option];

  async function getContractAddress({contractAddress}) {
    return contractAddress;
  }

  async function Deploy(_class, ...args) {
    const deployer = new _class(connection);
    deployer.loadAbi();
    console.debug(`Deploying ${deployer.constructor?.name} with args:`, ...(args || []));
    return getContractAddress(await deployer.deployJsonAbi(...(args || [])))
  }

  async function deployNetwork(governanceToken, registryAddress) {
    return Deploy(Network_v2, governanceToken, registryAddress);
  }

  async function deployRegistry(governanceToken, bountyToken) {
    return Deploy(NetworkRegistry, governanceToken, DEPLOY_LOCK_AMOUNT_FOR_NETWORK_CREATION, treasury, DEPLOY_LOCK_FEE_PERCENTAGE, DEPLOY_CLOSE_BOUNTY_FEE, bountyToken);
  }

  async function deployERC20(name, symbol) {
    return Deploy(ERC20, name, symbol, DEPLOY_TOKENS_CAP_AMOUNT)
  }

  async function deployBountyToken() {
    return Deploy(BountyToken, `BEPRO Bounty`, `~BEPRO`)
  }

  async function deployTokens() {
    const mapper = ([name, symbol]) => deployERC20(name, symbol);

    return Promise.all([[`Test USDC`, `TUSD`], [`Test BEPRO`, `TBEPRO`], [`Test Reward BEPRO`, `TRBEPRO`]].map(mapper));
  }

  async function changeNetworkOptions(networkAddress, tokens) {
    const network = new Network_v2(connection, networkAddress);
    await network.loadContract();
    await Promise.all([
      [`changeDraftTime`, DEPLOY_DRAFT_TIME],
      [`changeDisputableTime`, DEPLOY_DISPUTABLE_TIME],
      [`changeCouncilAmount`, DEPLOY_COUNCIL_AMOUNT]
    ].map(([fn, value]) => network[fn](value)));

    [[tokens[0], true], ... tokens[1] !== nativeZeroAddress ? [tokens[1], false] : []]
      .map(([address, transactional]) => network.registry.addAllowedTokens(address, transactional));

    await network.registry.token.approve(network.registry.contractAddress, DEPLOY_LOCK_AMOUNT_FOR_NETWORK_CREATION);
    await network.registry.lock(DEPLOY_LOCK_AMOUNT_FOR_NETWORK_CREATION);
    await network.registry.registerNetwork(networkAddress);

    const nameSymbol = async (address) => {
      const token = new ERC20(connection, address);
      await token.loadContract();
      return ({name: await token.name(), symbol: await token.symbol()});
    }

    const tokenInfo =
      async (isTransactional, isReward, address) =>
        ({...nameSymbol(address), isTransactional, isReward, address})

    return {
      registry: network.registry.contractAddress,
      payment: await tokenInfo(true, false, tokens[0]),
      governance: await tokenInfo(true, false, tokens[1]),
      reward: tokens[2] !== nativeZeroAddress ? await tokenInfo(true, false, tokens[2]) : {},
      bounty: await tokenInfo(true, false, tokens[3])
    }
  }

  async function saveSettingsToDb({registry, payment, governance, reward, bounty},) {
    const env = require('dotenv').config({path: options.envFile[option]});
    const {}
  }

  const saveTokens = [];

  /** Deploy or use provided tokens */
  if (should_deployTokens) {
    saveTokens.push(...Object.values(await deployTokens()), await deployBountyToken());

    const mapper = async (address) => {
      const _token = new ERC20(connection, address);
      await _token.loadContract();
      return _token;
    }

    const transfers = async ([payment, governance, rwd]) => {
      for (const address of StagingAccounts) {
        console.debug(`10M to ${address}`);
        await payment.transferTokenAmount(address, 10000000);
        await governance.transferTokenAmount(address, 10000000);
        await rwd.transferTokenAmount(address, 10000000);
      }
    }

    Promise.all(saveTokens.slice(0, 2).map(mapper)).then(transfers)
  } else if (!hasGovernance || !hasPayment || !hasBountyNFT)
    throw new Error(`Missing options.governanceToken and/or options.hasPayment`);

  if (!saveTokens.length)
    saveTokens.push(...[options.paymentToken[option], options.governanceToken[option], nativeZeroAddress, options.bountyNFT[option]]);

  await changeNetworkOptions(await deployNetwork(saveTokens[0], await deployRegistry(saveTokens[1], saveTokens[3])));

}