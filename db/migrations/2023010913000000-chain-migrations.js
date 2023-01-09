const ChainEvents = require("../models/chain-events.model");

async function up(queryInterface, Sequelize) {
  await queryInterface.createTable("chains", ChainEvents.getAttributes());

  const chain_id = {type: Sequelize.INTEGER}

  await queryInterface.addColumn('networks', 'chain_id', chain_id);
  await queryInterface.addColumn('issues', 'chain_id', chain_id);

}

async function down(queryInterface, Sequelize) {
  await queryInterface.dropTable('chains');
  await queryInterface.removeColumn('networks', 'chain_id');
}

module.exports = {up, down}