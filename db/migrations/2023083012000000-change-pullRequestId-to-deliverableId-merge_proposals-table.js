"use strict";

module.exports = {
  up: async (queryInterface, Sequelize) => {
    await queryInterface.addColumn("merge_proposals", "deliverableId", {
      type: Sequelize.INTEGER,
      references: {
        model: "deliverables",
        key: "id",
      },
    });

    await queryInterface.sequelize.query(`
          UPDATE "merge_proposals" AS proposal
          SET "deliverableId" = d."id"
          FROM "pull_requests" AS pr
          JOIN "deliverables" AS d ON pr."contractId" = d."prContractId" AND pr."issueId" = d."issueId"
          WHERE proposal."pullRequestId" = pr."id"
        `);

    await queryInterface.removeColumn("merge_proposals", "pullRequestId");
  },

  down: async (queryInterface, Sequelize) => {
    await queryInterface.removeColumn("merge_proposals", "deliverableId");
    await queryInterface.addColumn("merge_proposals", "pullRequestId", {
      type: Sequelize.INTEGER,
      references: {
        model: "pull_requests",
        key: "id",
      },
    });
  },
};
