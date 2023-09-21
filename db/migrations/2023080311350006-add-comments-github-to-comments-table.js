const { Octokit } = require("octokit");
const { getAllFromTable } = require("../../helpers/db/rawQueries");

const { SKIP_MIGRATION_SEED_COMMENTS_DATE_GITHUB, NEXT_GH_TOKEN, NEXT_PUBLIC_GH_USER } = process.env;

const PullRequestReviews = 
`query Reviews($repo: String!, $owner: String!, $id: Int!) {
  repository(name: $repo, owner: $owner) {
    pullRequest(number: $id) {
      reviews(first: 100) {
        nodes {
          user: author {
            login
          }
          body: bodyText
          created_at: createdAt
          updated_at: updatedAt
        }
      }
    }
  }
}`;

function getUpdatedLink(commentBody, networkName, chainName, bountyId) {
  const link = commentBody.split("](")[1].slice(0, -1);
  try {
    const linkUrl = new URL(link);

    return `${linkUrl.origin}/${networkName}/${chainName}/bounty/${bountyId}`;
  } catch (error) {
    console.log("Failed to get updated link from: ", link);
    return link;
  }
}

async function updateCommentLinkOnGithub(octokit, comment, owner, repo, networkName, chainName, bountyId) {
  try {
    const updatedLink = getUpdatedLink(comment.body, networkName, chainName, bountyId);
    const updatedBody = `${comment.body.split(" - ")[0]} - [check your bounty](${updatedLink})`;
    await octokit.rest.issues.updateComment({
      owner,
      repo,
      comment_id: comment.id,
      body: updatedBody,
    });
  } catch (error) {
    console.log("Failed to update comment on github", {comment: comment.body, networkName, chainName, bountyId}, error );
  }
}

async function handleAddComments(queryInterface, users, comment, id, type, prId, networkName = null, chainName = null) {
  const getCommentCreateData = (userId, userAddress, body) => ({
    userId,
    userAddress,
    comment: body,
    issueId: id,
    hidden: false,
    type,
    createdAt: comment.created_at,
    updatedAt: comment.updated_at,
    ...(prId ? { deliverableId: prId } : null),
  });

  const getUser = (name) => users.find(user => user.githubLogin === name);

  if (comment.body.startsWith("@") && comment.user.login.toLowerCase() === NEXT_PUBLIC_GH_USER) {
    const userTaggedByBot = getUser(
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
            text = `Finished a solution - [check your bounty](${getUpdatedLink(comment.body, networkName, chainName, id)})`;
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

      await queryInterface.bulkInsert("comments", [getCommentCreateData(userTaggedByBot.id, userTaggedByBot.address, text)]);
    }
  } else {
    const commentCreatorUser = getUser(comment.user.login);

    if (commentCreatorUser)
      queryInterface.bulkInsert("comments", [getCommentCreateData(commentCreatorUser.id, commentCreatorUser.address, comment.body)]);
  }
}

async function up(queryInterface, Sequelize) {
  if (SKIP_MIGRATION_SEED_COMMENTS_DATE_GITHUB === "true") return;

  const issues = await getAllFromTable(queryInterface, "issues");
  const networks = await getAllFromTable(queryInterface, "networks");
  const chains = await getAllFromTable(queryInterface, "chains");
  const openIssues = issues?.filter(issue => issue.state !== "pending" && !!issue.issueId);

  if (!openIssues?.length) return;

  const repositories = await getAllFromTable(queryInterface, "repositories");
  const pullRequests = await getAllFromTable(queryInterface, "pull_requests");
  const users = await getAllFromTable(queryInterface, "users");

  const octokit = new Octokit({
    auth: NEXT_GH_TOKEN,
  });

  try {
    let repository;
    let network;
    let chain;

    for (const issue of openIssues) {
      if (issue.repository_id !== repository?.id)
        repository = repositories.find(({ id }) => id === issue.repository_id);
      
        if (issue.network_id !== network?.id)
          network = networks.find(({ id }) => id === issue.network_id);
      
        if (issue.chain_id !== chain?.chainId)
          chain = chains.find(({ chainId }) => chainId === issue.chain_id);

      const [owner, repo] = repository?.githubPath?.split("/");

      const { data: commentsGithub } = await octokit.rest.issues.listComments({
        owner,
        repo,
        issue_number: issue.githubId,
      });

      for (const comment of commentsGithub) {
        await handleAddComments(queryInterface, users, comment, issue?.id, "issue", null, network.name, chain.chainShortName);
        if (comment.body.includes("check your bounty"))
          await updateCommentLinkOnGithub(octokit, comment, owner, repo, network.name, chain.chainShortName, issue.id);
      }

      const pullRequestsOfIssue = pullRequests?.filter(pr => pr.issueId === issue.id);

      for (const pr of pullRequestsOfIssue) {
        const { data: commentsPr } = await octokit.rest.issues.listComments({
          owner,
          repo,
          issue_number: pr.githubId,
        });

        const reviewComments = await octokit.graphql(PullRequestReviews, {
          repo,
          owner,
          id: +pr.githubId
        })
          .then(data => data.repository.pullRequest.reviews.nodes);

        for (const commentPr of commentsPr) {
          await handleAddComments(queryInterface, users, commentPr, issue?.id, "deliverable", pr?.id);
        }

        for (const reviewPr of reviewComments) {
          await handleAddComments(queryInterface, users, reviewPr, issue?.id, "deliverable", pr?.id);
        }
      }
    }
  } catch (error) {
    console.log("Failed to add comments from github", error.toString());
  }
}

module.exports = { up, down: async () => true };
