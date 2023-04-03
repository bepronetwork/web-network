"use strict";

const Settings = require("../models/settings.model");
const name = "change-councilAmount-max-settings-table";
const councilAmountMax = 100000000000; //100B
const defaultCouncilAmountMin = 100001;

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log("start:", name);

    Settings.init(queryInterface.sequelize);

    const settings = await Settings.findOne({
      where: {
        key: "councilAmount",
      },
    });

    if (!settings)
      console.log(`${name} - Settings Key: CouncilAmount not found`);

    settings.value = `{ "min": ${defaultCouncilAmountMin}, "max": ${councilAmountMax} }`;
    await settings.save();
    console.log(`${name} - Settings Key: CouncilAmount params updated`);
  },
  async down(queryInterface, Sequelize) {

  }
};
