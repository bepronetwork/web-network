const { Network_v2, Web3Connection } = require("@taikai/dappkit");
const { Op } = require("sequelize");

const ChainModel = require("../models/chain.model");
const TokensModel = require("../models/tokens.model");
const NetworkModel = require("../models/network.model");
const ChainEventsModel = require("../models/chain-events.model");
const IssueModel = require("../models/issue.model");

const {
  NEXT_PUBLIC_NEEDS_CHAIN_ID: defaultChainId,
  NEXT_PUBLIC_NEEDS_CHAIN_NAME: defaultChainName,
  NEXT_PUBLIC_BLOCKSCAN_LINK: defaultBlockScanLink,
  NEXT_PUBLIC_NATIVE_TOKEN_NAME: defaultNativeTokenName,
  NEXT_PUBLIC_EVENTS_API: defaultEventsUrl,
  NEXT_PUBLIC_WEB3_CONNECTION: defaultRpc,
  NEXT_PUBLIC_CHAIN_DECIMALS: defaultDecimals,
  NEXT_PUBLIC_NETWORK_REGISTRY_ADDRESS: defaultRegisryAddress,
  SKIP_MIGRATION_MULTICHAIN = "true"
} = process.env;

async function up(queryInterface, Sequelize) {
  if (SKIP_MIGRATION_MULTICHAIN === "true") return;

  NetworkModel.init(queryInterface.sequelize);
  ChainModel.init(queryInterface.sequelize);
  TokensModel.init(queryInterface.sequelize);
  ChainEventsModel.init(queryInterface.sequelize);
  IssueModel.init(queryInterface.sequelize);

  const findToken = (address, chainId) => TokensModel.findOne({
    where: {
      address: address,
      chain_id: chainId
    }
  });

  // Create default chain and update tables chain_id
  await ChainModel.findOrCreate({
    where: {
      chainId: defaultChainId
    },
    defaults: {
      chainId: defaultChainId,
      chainRpc: defaultRpc,
      chainName: defaultChainName,
      chainShortName: defaultChainName?.replaceAll(" ", "-")?.toLowerCase(),
      chainCurrencyName: defaultNativeTokenName,
      chainCurrencySymbol: defaultNativeTokenName,
      chainCurrencyDecimals: defaultDecimals,
      registryAddress: defaultRegisryAddress,
      eventsApi: defaultEventsUrl,
      blockScanner: defaultBlockScanLink,
      isDefault: false,
      color: "#4250e4"
    }
  });

  const defaultChainIdWhereNull = [{
    chain_id: defaultChainId
  }, {
    where: {
      chain_id: null
    }
  }];

  await NetworkModel.update(...defaultChainIdWhereNull);

  await TokensModel.update(...defaultChainIdWhereNull);

  await ChainEventsModel.update(...defaultChainIdWhereNull);

  await IssueModel.update(...defaultChainIdWhereNull);

  // Other updates that came with multichain
  const networks = await NetworkModel.findAll({
    include: [
      {
        association: "issues",
        where: {
          fundingAmount: {
            [Op.notIn]: [null, "0"]
          }
        }
      }
    ]
  });

  if (!networks.length) return;

  const web3Connection = new Web3Connection({
    skipWindowAssignment: true,
    web3Host: web3Host,
  });

  await web3Connection.start();

  for (const network of networks) {
    const networkV2 = new Network_v2(web3Connection, network.networkAddress);

    await networkV2.loadContract();

    const networkToken = await findToken(networkV2.networkToken.contractAddress, network.chain_id);

    if (networkToken)
      network.network_token_id = networkToken.id;

    const [
      disputableTime,
      draftTime,
      oracleExchangeRate,
      mergeCreatorFeeShare,
      percentageNeededForDispute,
      cancelableTime,
      proposerFeeShare
    ] = await Promise.all([
      networkV2.disputableTime(),
      networkV2.draftTime(),
      networkV2.oracleExchangeRate(),
      networkV2.mergeCreatorFeeShare(),
      networkV2.percentageNeededForDispute(),
      networkV2.cancelableTime(),
      networkV2.proposerFeeShare()
    ]);

    network.disputableTime = disputableTime;
    network.draftTime = draftTime;
    network.oracleExchangeRate = oracleExchangeRate;
    network.mergeCreatorFeeShare = mergeCreatorFeeShare;
    network.percentageNeededForDispute = percentageNeededForDispute;
    network.cancelableTime = cancelableTime;
    network.proposerFeeShare = proposerFeeShare;

    await network.save();

    if (!network.issues.length) continue;

    for (const issue of issues) {
      const bounty = await networkV2.getBounty(issue.contractId);

      const rewardToken = await findToken(bounty.rewardToken, network.chain_id);

      bounty.rewardTokenId = rewardToken.id;
      bounty.rewardAmount = bounty.rewardAmount;

      await bounty.save();
    }
  }
}

async function down(queryInterface, Sequelize) {
  if (SKIP_MIGRATION_MULTICHAIN === "true") return;
}

module.exports = {up, down}