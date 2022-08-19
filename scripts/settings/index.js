const Sequelize = require("sequelize");

const DBConfig = require("../../db/config");
const SettingsModel = require("../../db/models/settings.model");

const combineSettings = (settingsA, settingsB) => {
  const keysA = Object.keys(settingsA);
  const keysB = Object.keys(settingsB);
  const repeatedKeys = keysA.filter(key => keysB.includes(key));

  return {
    ...settingsA,
    ...settingsB,
    ...Object.fromEntries(repeatedKeys.map(key => [key, {...settingsA[key], ...settingsB[key] }]))
  };
}

const parseSettingValue = setting => {
  const parsers = {
    "string": value => value,
    "json": value => JSON.parse(value),
    "number": value => +value,
    "boolean": value => value === "true"
  };

  return parsers[setting.type](setting.value);
};

const settingsToJson = settings => {
  const settingsJson = {};

  settings.forEach(setting => {
    const parsedValue = parseSettingValue(setting);

    const key = setting.group || setting.key;
    let value = parsedValue;

    if (setting.group)
      value = { 
        ...settingsJson[key],
        [setting.key]: parsedValue 
      };

    settingsJson[key] = value;
  });

  return settingsJson;
};

const parseSettingsFromDB = async () => {
  const sequelize = new Sequelize(DBConfig.database, DBConfig.username, DBConfig.password, DBConfig);

  SettingsModel.init(sequelize);

  const settings = await SettingsModel.findAll({ where: { visibility: "private" }, raw: true });

  return settingsToJson(settings);
}

module.exports = {
  parseSettingsFromDB,
  combineSettings
}