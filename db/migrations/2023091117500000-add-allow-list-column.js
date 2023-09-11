const {DataTypes} = require("sequelize");
module.exports = {
  up: async (queryInterface,) => {
    await queryInterface.addColumn("networks", "allow_list", {
      type: DataTypes.ARRAY(DataTypes.STRING),
      defaultValue: [],
    });
  },
  down: async (queryInterface,) => {
    await queryInterface.removeColumn("networks", "allow_list");
  }
}
