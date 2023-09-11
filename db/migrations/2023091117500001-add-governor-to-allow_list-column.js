module.exports = {
  up: async (queryInterface, Sequelize) => {
    /** todo: this can be made into one single sql query */

    const curatorsWithNetworkDbWithAllowListEmpty = await queryInterface.sequelize
      .query(`select "creatorAddress", id from networks where array_length(allow_list, 1) = 0`);

    for (const row of curatorsWithNetworkDbWithAllowListEmpty)
      await queryInterface.sequelize.query(`update networks set allow_list = array (row.creatorAddress) where id = row.id`);
  }
}
