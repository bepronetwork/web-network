require("dotenv").config();

const Sequelize = require("sequelize");

const DBConfig = require("../../db/config");
const SettingsModel = require("../../db/models/settings.model");
const TokensModel = require("../../db/models/tokens.model");

const SettingItem = (key, value, visibility, type, group = undefined) => ({ key, value, type, visibility, group });
const PublicSettingItem = (key, value, type = "string", group = undefined) => SettingItem(key, value, "public", type, group);

const publicSettings = [
  PublicSettingItem("api", process.env.NEXT_PUBLIC_API_HOST, "string", "urls"),
  PublicSettingItem("home", process.env.NEXT_PUBLIC_HOME_URL, "string", "urls"),
  PublicSettingItem("ipfs", process.env.NEXT_PUBLIC_IPFS_BASE, "string", "urls"),
  PublicSettingItem("blockScan", process.env.NEXT_PUBLIC_BLOCKSCAN_LINK, "string", "urls"),
  PublicSettingItem("web3Provider", process.env.NEXT_PUBLIC_WEB3_CONNECTION, "string", "urls"),
  PublicSettingItem("settlerToken", process.env.NEXT_PUBLIC_SETTLER_ADDRESS, "string", "contracts"),
  PublicSettingItem("network", process.env.NEXT_PUBLIC_CONTRACT_ADDRESS, "string", "contracts"),
  PublicSettingItem("transactionalToken", process.env.NEXT_PUBLIC_TRANSACTION_ADDRESS, "string", "contracts"),
  PublicSettingItem("networkRegistry", process.env.NEXT_PUBLIC_NETWORK_REGISTRY_ADDRESS, "string", "contracts"),
  PublicSettingItem("botUser", process.env.NEXT_PUBLIC_GH_USER, "string", "github"),
  PublicSettingItem("token", process.env.NEXT_PUBLIC_NATIVE_TOKEN_NAME, "string", "requiredChain"),
  PublicSettingItem("id", process.env.NEXT_PUBLIC_NEEDS_CHAIN_ID, "string", "requiredChain"),
  PublicSettingItem("name", process.env.NEXT_PUBLIC_NEEDS_CHAIN_NAME, "string", "requiredChain"),
  PublicSettingItem("excludedJurisdictions", process.env.NEXT_PUBLIC_COUNTRY_CODE_BLOCKED, "json"),
  PublicSettingItem("api", process.env.NEXT_PUBLIC_CURRENCY_API, "string", "currency"),
  PublicSettingItem("defaultFiat", process.env.NEXT_PUBLIC_CURRENCY_MAIN, "string", "currency"),
  PublicSettingItem("defaultToken", process.env.NEXT_PUBLIC_CURRENCY_ID, "string", "currency"),
  PublicSettingItem("conversionList", process.env.NEXT_PUBLIC_CURRENCY_VSLIST, "json", "currency"),
  PublicSettingItem("1", "ethereum", "string", "chainIds"),
  PublicSettingItem("3", "ropsten", "string", "chainIds"),
  PublicSettingItem("4", "rinkeby", "string", "chainIds"),
  PublicSettingItem("5", "goerli", "string", "chainIds"),
  PublicSettingItem("42", "kovan", "string", "chainIds"),
  PublicSettingItem("1285", "moonriver", "string", "chainIds"),
  PublicSettingItem("1337", "localhost", "string", "chainIds"),
  PublicSettingItem("1500", "seneca", "string", "chainIds"),
  PublicSettingItem("1501", "afrodite", "string", "chainIds"),
  PublicSettingItem("1502", "irene", "string", "chainIds"),
  PublicSettingItem("1503", "iris", "string", "chainIds"),
  PublicSettingItem("1287", "moonbase", "string", "chainIds"),
  PublicSettingItem("disputableTime", `{ "min": 60, "max": 1728000 }`, "json", "networkParametersLimits"),
  PublicSettingItem("draftTime", `{ "min": 60, "max": 1728000 }`, "json", "networkParametersLimits"),
  PublicSettingItem("councilAmount", `{ "min": 100001, "max": 50000000 }`, "json", "networkParametersLimits"),
  PublicSettingItem("disputePercentage", `{ "max": 15 }`, "json", "networkParametersLimits"),
  PublicSettingItem("name", process.env.NEXT_PUBLIC_DEFAULT_NETWORK_NAME, "string", "defaultNetworkConfig"),
  PublicSettingItem("allowCustomTokens", process.env.NEXT_PUBLIC_ALLOW_CUSTOM_TOKENS, "boolean", "defaultNetworkConfig"),
  PublicSettingItem("adminWallet", process.env.NEXT_PUBLIC_ADMIN_WALLET_ADDRESS, "string", "defaultNetworkConfig"),
];

const saveSettingsFromEnv = async () => {
  const sequelize = new Sequelize(DBConfig.database, DBConfig.username, DBConfig.password, DBConfig);

  SettingsModel.init(sequelize);

  await SettingsModel.bulkCreate(publicSettings);
}

const updateSetting = async (key, value, group = undefined, type = "string", visibility = "public") => {
  const sequelize = new Sequelize(DBConfig.database, DBConfig.username, DBConfig.password, DBConfig);

  SettingsModel.init(sequelize);

  const [, created] = await SettingsModel.findOrCreate({
    where: { key, group, type, visibility },
    defaults: {
      value
    }
  });

  if (!created)
    await SettingsModel.update({ value }, { where: { key, group }, individualHooks: true });
}

const updateTokens = async ({
    name,
    symbol,
    isTransactional,
    address
  }) => {
    const sequelize = new Sequelize(DBConfig.database, DBConfig.username, DBConfig.password, DBConfig);
  
    TokensModel.init(sequelize);
  
    const [, created] = await TokensModel.findOrCreate({
      where: {
        name,
        symbol,
        isTransactional
      },
      defaults: {
        address
      }
    });

  if (!created)
    await TokensModel.update({ address }, { where: { name, symbol, isTransactional }});
}

module.exports = {
  saveSettingsFromEnv,
  updateSetting,
  updateTokens
}