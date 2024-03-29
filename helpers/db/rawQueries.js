const { QueryTypes } = require("sequelize");

async function getTokenByAddressAndChainId(queryInterface, address, chain_id) {
  return queryInterface.sequelize.query(`SELECT * FROM tokens WHERE "address" = $address AND "chain_id" = $chain_id`, {
    bind: {
      address,
      chain_id
    },
    type: QueryTypes.SELECT
  });
}

async function getAllFromTable(queryInterface, table) {
  return queryInterface.sequelize.query(`SELECT * FROM ${table}`, {
    type: QueryTypes.SELECT
  });
}

module.exports = {
  getTokenByAddressAndChainId,
  getAllFromTable
}