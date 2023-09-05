const { getAllFromTable } = require("../../helpers/db/rawQueries");

async function up(queryInterface, Sequelize) {
  const issues = await getAllFromTable(queryInterface, "issues");
  const users = await getAllFromTable(queryInterface, "users");

  const issuesWithUsersWorking = issues?.filter(issue => !!issue?.working?.length);

  if (!issuesWithUsersWorking?.length) return;

  try {
    for (const issue of issues) {
      const working = issue.working.map(login => users?.find(({ githubLogin}) => githubLogin === login)?.id);

      await queryInterface.bulkUpdate("issues", {
        working
      }, {
        id: issue.id
      });
    }
  } catch (error) {
    console.log(
      "Failed to changing working issue with userId",
      error.toString()
    );
  }
}

module.exports = { up, down: async () => true };
