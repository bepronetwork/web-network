"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("comments", "newDeliverableId", {
        type: Sequelize.INTEGER,
        references: {
          model: "deliverables",
          key: "id",
        },
      });

    await queryInterface.sequelize.query(`
      UPDATE "comments" AS c
      SET "newDeliverableId" = d."id"
      FROM "pull_requests" AS pr
      JOIN "deliverables" AS d ON pr."contractId" = d."prContractId"
      WHERE c."deliverableId" = pr."id"
    `);

    await queryInterface.removeColumn('comments', 'deliverableId');
    await queryInterface.renameColumn('comments', 'newDeliverableId', 'deliverableId');
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("comments", "deliverableId");
    await queryInterface.addColumn("comments", "deliverableId", {
      type: Sequelize.INTEGER,
      allowNull: true,
      references: {
        model: "pull_requests",
        key: "id",
      },
    });
  },
};
