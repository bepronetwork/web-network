const { Op } = require("sequelize");
const Octokit = require("octokit").Octokit;
const ChainModel = require("../models/chain.model");
const NetworkModel = require("../models/network.model");
const IssueModel = require("../models/issue.model");
const TokenModel = require("../models/tokens.model");
const RepositoryModel = require("../models/repositories.model");
const PullRequestModel = require("../models/pullRequest.model");
const MergeProposalModel = require("../models/mergeproposal");
const CuratorsModel = require("../models/curator-model");
const BenefactorModel = require("../models/benefactor.model");
const DisputeModel = require("../models/dispute-model");
const UserPaymentsModel = require("../models/user-payments");
const DeveloperModel = require("../models/developer.model");
const CommentsModel = require("../models/comments.model");
const UserModel = require("../models/user");

const { SKIP_MIGRATION_SEED_COMMENTS_DATE_GITHUB, NEXT_GH_TOKEN } = process.env;
const BOT_NAME = 'bepro-bot'

async function handleAddComments(comment, id, type, prId) {
  const getCommentCreateData = (userId, userAddress, body) => ({
    userId,
    userAddress,
    comment: body,
    issueId: id,
    hidden: false,
    type,
    created_at: comment.created_at,
    updated_at: comment.updated_at,
    ...(prId ? { deliverableId: prId } : null),
  });

  const getUser = (name) =>
    UserModel.findOne({
      where: {
        githubLogin: name,
      },
    });

  if (comment.body.startsWith("@") && comment.user.login === BOT_NAME) {
    const userTaggedByBot = await getUser(
      comment.body.split(" ")[0].replace("@", "")
    );
    let text;

    if (userTaggedByBot) {
      switch (type) {
        case "issue": {
          //Example text: "@name  is working on this."
          if (/working/.test(comment.body)) {
            text = `i'm working on this.`;
            break;
          }
          //Example text: "has a solution - [check your bounty](https://)"
          if (/solution/.test(comment.body)) {
            text = `finished a solution -${comment.body.split("-")[1]}`;
            break;
          }
        }

        case "deliverable": {
          //Example text: "reviewed this Pull Request with the following message:    Message"
          if (/Pull Request/.test(comment.body)) {
            text = comment.body.split("message:")[1];
            break;
          }
        }
      }

      await CommentsModel.create(getCommentCreateData(userTaggedByBot.id, userTaggedByBot.address, text))
    }
  } else {
    const commentCreatorUser = await getUser(comment.user.login);

    if (commentCreatorUser)
      CommentsModel.create(getCommentCreateData(commentCreatorUser.id, commentCreatorUser.address, comment.body))
  }
}

async function up(queryInterface, Sequelize) {
  if (SKIP_MIGRATION_SEED_COMMENTS_DATE_GITHUB === "true") return;

  [
    ChainModel,
    NetworkModel,
    IssueModel,
    CuratorsModel,
    RepositoryModel,
    PullRequestModel,
    MergeProposalModel,
    TokenModel,
    BenefactorModel,
    DisputeModel,
    UserPaymentsModel,
    DeveloperModel,
    CommentsModel,
    UserModel,
  ].forEach((model) => model.init(queryInterface.sequelize));

  [ChainModel, NetworkModel, IssueModel].forEach((model) =>
    model.associate(queryInterface.sequelize.models)
  );

  const issues = await IssueModel.findAll({
    where: {
      state: { [Op.not]: "pending" },
    },
    include: [{ association: "repository" }, { association: "pullRequests" }],
    required: true,
  });

  if (!issues.length) return;

  const octokit = new Octokit({
    auth: NEXT_GH_TOKEN,
  });

  try {
    
    for (const issue of issues) {
      const [owner, repo] = issue?.repository?.githubPath.split("/");

      const { data: commentsGithub } = await octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number: issue.githubId,
      });

      for (const comment of commentsGithub) {
        await handleAddComments(comment, issue?.id, "issue");
      }

      for (const pr of issue.pullRequests) {
        const { data: commentsPr } = await octokit.rest.issues.listComments({
          owner,
          repo,
          issue_number: pr.githubId,
        });

        for (const commentPr of commentsPr) {
          await handleAddComments(commentPr, issue?.id, "deliverable", pr?.id);
        }
      }
    }
  } catch (error) {
    console.log("Failed to add comments from github", error.toString());
  }
}

module.exports = { up };
