"use strict";

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable("kyc_sessions", {
      id: {
        type: Sequelize.INTEGER,
        autoIncrement: true,
        primaryKey: true,
        unique: true,
      },
      user_id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        references: {
          model: "users",
          key: "id"
        }
      },
      session_id: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      tier:{
        type:  Sequelize.INTEGER,
        allowNull: false,
      },
      state: {
        type: Sequelize.STRING,
      },
      validatedAt: {
        allowNull: true,
        type: Sequelize.DATE,
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE,
        defaultValue: Sequelize.fn('now')
      },
    });
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable("kyc_sessions");
  },
};
