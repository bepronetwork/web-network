const Sequelize = require("sequelize");

const DBConfig = require("../../db/config");
const SettingsModel = require("../../db/models/settings.model");
const { Settings } = require("../../interfaces/settings.js");

const loadSettingsFromDB = async (settingsToCombine = undefined) => {
  const sequelize = new Sequelize(DBConfig.database, DBConfig.username, DBConfig.password, DBConfig);

  SettingsModel.init(sequelize);

  const settings = await SettingsModel.findAll({ where: { visibility: "private" }, raw: true });

  const settingsList = new Settings(settings);

  return settingsList.raw(settingsToCombine);
}

module.exports = {
  loadSettingsFromDB
}