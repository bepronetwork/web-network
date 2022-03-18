const { QueryTypes } = require("sequelize");

const { Issue } = require("../models/issue.model");
require("dotenv").config();

module.exports = {
  up: async (queryInterface, Sequelize) => {
    queryInterface
      .addColumn("issues", "branch", {
        type: Sequelize.STRING
      })
      .then(async () => {
        const [results, metadata] = await queryInterface.sequelize.query(
          "UPDATE issues SET branch = $branch WHERE branch IS NULL",
          {
            bind: {
              branch: process.env.NEXT_GITHUB_MAINBRANCH || "master"
            }
          }
        );

        console.log({ results, metadata });
      });
  },
  down: async (queryInterface, Sequelize) => {
    queryInterface.removeColumn("issues", "branch");
  }
};
