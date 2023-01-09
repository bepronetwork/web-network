require("dotenv").config();

const Sequelize = require("sequelize");
const { Op } = require("sequelize");

const DBConfig = require("../db/config");
const User = require("../db/models/user");
const Issue = require("../db/models/issue.model");
const LeaderBoard = require("../db/models/leaderboard.model");
const MergeProposal = require("../db/models/mergeproposal");

const sequelize = new Sequelize(DBConfig.database, DBConfig.username, DBConfig.password, DBConfig);

User.init(sequelize);
Issue.init(sequelize);
LeaderBoard.init(sequelize);
MergeProposal.init(sequelize);

Issue.hasMany(MergeProposal, {
  foreignKey: "issueId",
  sourceKey: "id",
  as: "mergeProposals"
});

MergeProposal.belongsTo(Issue, {
  foreignKey: "issueId",
  sourceKey: "id",
  as: "issue"
});

async function updateLeaderboardRow(address, property, value) {
  const userLeaderboard = await LeaderBoard.findOne({
    where: { address }
  });

  if(userLeaderboard) {
    userLeaderboard[property] = value;

    await userLeaderboard.save();
  } else
    await LeaderBoard.create({
      address,
      [property]: value,
    });
}

/**
 * Update leaderboard bounties quantity. If the parameter is not passed it will count all bounties.
 * @param {"canceled" | "closed"} [state]
 */

async function updateLeaderboardBounties(state = "opened") {
  try {
    const bountiesOfCreators = await Issue.findAll({
      group: ["creatorAddress"],
      attributes: ["creatorAddress", [Sequelize.fn("COUNT", "creatorAddress"), "id"]],
      raw: true,
      ... state !== "opened" ? {
        where: {
          state
        }
      } : {}
    });

    if (!bountiesOfCreators.length) 
      return console.log(`Leaderboard: updateLeaderboardBounties ${state} no bounties found`);

    const leaderBoardColumnsByState = {
      opened: "ownedBountiesOpened",
      canceled: "ownedBountiesCanceled",
      closed: "ownedBountiesClosed",
    } 

    for (const creator of bountiesOfCreators) {
      const { creatorAddress, id: bountiesCount} = creator;

      await updateLeaderboardRow(creatorAddress, leaderBoardColumnsByState[state], bountiesCount);

      console.log(`Leaderboard: updateLeaderboardBounties ${state} of ${creatorAddress} to ${bountiesCount}`);
    }
  } catch (error) {
    console.log(`Leaderboard: failed to updateLeaderboardBounties ${state}`, error);
  }
}

/**
 * Update leaderboard proposals quantity. If the parameter is not passed it will count all proposals.
 * @param {"accepted" | "rejected"} [state]
 */
async function updateLeaderboardProposals(state = "created") {
  try {
    let stateCondition = {};

    if (state === "rejected")
      stateCondition = {
        where: {
          [Op.or]: [{ isDisputed: true }, { refusedByBountyOwner: true }]
        }
      };
    else if (state === "accepted")
      stateCondition = {
        attributes: ["creator", [Sequelize.fn("COUNT", "issue.id"), "id"]],
        include: [
          { 
            association: "issue",
            where: {
              state: "closed"
            },
            attributes: []
          }
        ]
      };

    const proposalsOfCreators = await MergeProposal.findAll({
      group: ["creator"],
      attributes: ["creator", [Sequelize.fn("COUNT", "creator"), "id"]],
      raw: true,
      ...stateCondition
    });

    if (!proposalsOfCreators.length) 
      return console.log(`Leaderboard: updateLeaderboardProposalCreated ${state} no bounties found`);

    const leaderBoardColumnsByState = {
      created: "ownedProposalCreated",
      accepted: "ownedProposalAccepted",
      rejected: "ownedProposalRejected"
    } 

    for (const creatorProposal of proposalsOfCreators) {
      const { creator, id: proposalsCount} = creatorProposal;

      await updateLeaderboardRow(creator, leaderBoardColumnsByState[state], proposalsCount);

      console.log(`Leaderboard: updateLeaderboardBounties ${state} of ${creator} to ${proposalsCount}`);
    }

  } catch (error) {
    console.log(`Leaderboard: failed to updateLeaderboardProposalCreated ${state}`, error);
  }
}

module.exports = {
  updateLeaderboardBounties,
  updateLeaderboardProposals
}