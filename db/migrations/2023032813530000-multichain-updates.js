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
}

async function down(queryInterface, Sequelize) {
  if (SKIP_MIGRATION_MULTICHAIN === "true") return;
}

module.exports = {up, down}