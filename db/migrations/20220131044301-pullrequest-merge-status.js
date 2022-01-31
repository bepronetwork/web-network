'use strict';

module.exports = {
  async up (queryInterface, Sequelize) {
    queryInterface.addColumn('pull_requests', 'mergeable', {type: Sequelize.BOOLEAN, default: null})
    queryInterface.addColumn('pull_requests', 'merged', {type: Sequelize.BOOLEAN, default: false})
    .then(async ()=>{
      const [results, metadata] = 
      await queryInterface.sequelize.query("UPDATE pull_requests SET merged = false WHERE merged IS NULL")

      console.log({results, metadata})
    })
  },

  async down (queryInterface, Sequelize) {
    queryInterface.removeColumn('pull_requests', 'mergeable');
    queryInterface.removeColumn('pull_requests', 'merged');
  }
};
