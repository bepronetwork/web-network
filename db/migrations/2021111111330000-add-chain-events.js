const { DataTypes } = require("sequelize");

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const lastBlock = 1731488;
    queryInterface
      .createTable("chainEvents", {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          unique: true
        },
        name: {
          type: DataTypes.STRING,
          allowNull: false,
          unique: true
        },
        lastBlock: {
          type: DataTypes.INTEGER
        }
      })
      .then(() => {
        queryInterface.bulkInsert("chainEvents", [
          { name: "Bulk", lastBlock },
          { name: "RedeemIssue", lastBlock },
          { name: "CloseIssue", lastBlock },
          { name: "MergeProposalCreated", lastBlock }
        ]);
      });
  },

  down: async (queryInterface, Sequelize) => {
    queryInterface.dropTable("chainEvents");
  }
};
