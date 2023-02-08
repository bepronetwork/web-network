"use strict";
const { getValueToLowerCase } = require("helpers/db/getters");
const { Model, DataTypes } = require("sequelize");
class Issue extends Model {
  static init(sequelize) {
    super.init({
      issueId: DataTypes.INTEGER,
      githubId: DataTypes.STRING,
      state: DataTypes.STRING,
      creatorAddress: {
        type: DataTypes.STRING,
        get() {
          return getValueToLowerCase(this, "creatorAddress");
        }
      },
      creatorGithub: DataTypes.STRING,
      amount: DataTypes.STRING,
      fundingAmount: DataTypes.STRING,
      fundedAmount: DataTypes.STRING,
      rewardAmount: {
        type: DataTypes.STRING,
        allowNull: true
      },
      repository_id: DataTypes.STRING,
      title: DataTypes.TEXT,
      body: DataTypes.TEXT,
      branch: DataTypes.STRING,
      working: {
        type: DataTypes.ARRAY(DataTypes.STRING)
      },
      merged: DataTypes.STRING,
      seoImage: DataTypes.STRING,
      network_id: DataTypes.INTEGER,
      contractId: DataTypes.INTEGER,
      transactionalTokenId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      rewardTokenId: {
        type: DataTypes.INTEGER,
        allowNull: true
      },
      fundedAt: {
        type: DataTypes.DATE,
        allowNull: true
      },
      tags: {
        type: DataTypes.ARRAY(DataTypes.STRING)
      },
      chain_id: {
        type: DataTypes.INTEGER
      }
    },
    {
      sequelize,
      modelName: "issue"
    });
  }

  static associate(models) {
    // define association here
    this.hasMany(models.developer, {
      foreignKey: "issueId",
      sourceKey: "id",
      as: "developers"
    });
    this.hasMany(models.pullRequest, {
      foreignKey: "issueId",
      sourceKey: "id",
      as: "pullRequests"
    });
    this.hasMany(models.mergeProposal, {
      foreignKey: "issueId",
      sourceKey: "id",
      as: "mergeProposals"
    });
    this.hasMany(models.benefactor, {
      foreignKey: "issueId",
      sourceKey: "id",
      as: "benefactors"
    });
    this.hasMany(models.dispute, {
      foreignKey: "issueId",
      sourceKey: "id",
      as: "disputes"
    });
    this.hasMany(models.userPayments, {
      foreignKey: "issueId",
      sourceKey: "id",
      as: "payments"
    });
    this.belongsTo(models.repositories, {
      foreignKey: "repository_id",
      sourceKey: "id",
      as: "repository"
    });
    this.belongsTo(models.network, {
      foreignKey: "network_id",
      sourceKey: "id"
    });
    this.belongsTo(models.tokens, {
      foreignKey: "transactionalTokenId",
      sourceKey: "id",
      as: "transactionalToken"
    });
    this.belongsTo(models.tokens, {
      foreignKey: "rewardTokenId",
      sourceKey: "id",
      as: "rewardToken"
    });
    this.belongsTo(models.chain, {
      foreignKey: "chain_id",
      targetKey: "chainId",
      as: "chain"
    });
  }
}

module.exports = Issue;
