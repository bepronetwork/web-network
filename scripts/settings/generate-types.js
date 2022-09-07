require("dotenv").config();

const fs = require("fs/promises");
const Sequelize = require("sequelize");

const DBConfig = require("../../db/config");
const SettingsModel = require("../../db/models/settings.model");

const generateTypes = async () => {
  const sequelize = new Sequelize(DBConfig.database, DBConfig.username, DBConfig.password, DBConfig);

  SettingsModel.init(sequelize);

  const settings = await SettingsModel.findAll({ raw: true, order: [ ["group", "ASC"] ]});

  const groups = settings.reduce((acc, setting) => acc.includes(setting.group) ? acc : [...acc, setting.group], []);

  let types = "export type SettingsType = {\n";

  types += groups.map(group => {
    let str = ``;

    if (group) str += `  ${group}: {\n`;

    str += settings.filter(setting => setting.group === group).map(setting => `${group && `    ` || `  `}${setting.key}: ${setting.type};`).join("\n") + "\n";

    if (group) str += `  };`;

    return str;
  })
    .join("\n")
    .replaceAll("json;", "any; //eslint-disable-line");

  types += "\n}";

  await fs.writeFile("./types/settings.d.ts", types, console.log);
}

generateTypes()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });


module.exports = {
  generateTypes
};