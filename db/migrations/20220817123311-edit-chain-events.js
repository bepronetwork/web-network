'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    return Promise.all([
      await queryInterface.dropTable('chainEvents'),
      await queryInterface
        .createTable("chain_events", {
          id: {
            type: Sequelize.INTEGER,
            autoIncrement: true,
          },
          name: {
            type: Sequelize.STRING,
            allowNull: false,
            unique: true
          },
          lastBlock: {
            type: Sequelize.INTEGER,
            defaultValue: 0,
          },
          createdAt: {
            allowNull: false,
            type: Sequelize.DATE
          },
          updatedAt: {
            allowNull: false,
            type: Sequelize.DATE
          }
        })
    ])
  },

  async down(queryInterface, Sequelize) {
    return Promise.all[
      await queryInterface.dropTable('chain_events'),
      await queryInterface.createTable('chainEvents', {
        id: {
          type: Sequelize.INTEGER,
          autoIncrement: true,
        },
        name: {
          type: Sequelize.STRING,
          allowNull: false,
          unique: true
        },
        lastBlock: {
          type: Sequelize.INTEGER
        },
      })
    ]
  }
};
