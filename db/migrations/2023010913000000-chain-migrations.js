const ChainEvents = require("../models/chain-events.model");
const {DataTypes} = require("sequelize");

async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("chains", {
    id: {
      type: Sequelize.INTEGER,
      autoIncrement: true,
      primaryKey: true,
      unique: true
    },
    chainId: {
      type: Sequelize.INTEGER,
      unique: true
    },
    chainRpc: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    chainName: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: true
    },
    chainShortName: {
      type: Sequelize.STRING,
      allowNull: false,
      unique: false
    },
    chainCurrencyName: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    chainCurrencySymbol: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    chainCurrencyDecimals: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    registryAddress: {
      type: Sequelize.STRING,
      allowNull: true
    },
    eventsApi: {
      type: Sequelize.STRING,
    },
    blockScanner: {
      type: DataTypes.STRING,
    },
    isDefault: {
      type: Sequelize.BOOLEAN
    },
    createdAt: {
      allowNull: false,
      type: Sequelize.DATE
    },
    updatedAt: {
      allowNull: false,
      type: Sequelize.DATE
    }
  });

  const chain_id = {type: Sequelize.INTEGER}

  await queryInterface.addColumn('networks', 'chain_id', chain_id);
  await queryInterface.addColumn('issues', 'chain_id', chain_id);
  await queryInterface.addColumn('chain_events', 'chain_id', chain_id);

}

async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('chains');
  await queryInterface.removeColumn('networks', 'chain_id');
  await queryInterface.removeColumn('issues', 'chain_id');
  await queryInterface.removeColumn('chain_events', 'chain_id');
}

module.exports = {up, down}