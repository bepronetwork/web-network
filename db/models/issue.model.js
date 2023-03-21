"use strict";
const { getValueToLowerCase } = require("../../helpers/db/getters");
const { Model, DataTypes } = require("sequelize");
const { BigNumber } = require("bignumber.js");
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
      fundingAmount: {
        type: DataTypes.STRING,
        defaultValue: "0"
      },
      fundedAmount: {
        type: DataTypes.STRING,
        defaultValue: "0"
      },
      rewardAmount: {
        type: DataTypes.STRING,
        defaultValue: "0"
      },
      repository_id: DataTypes.STRING,
      title: DataTypes.TEXT,
      body: DataTypes.TEXT,
      branch: DataTypes.STRING,
      working: DataTypes.ARRAY(DataTypes.STRING),
      merged: DataTypes.STRING,
      seoImage: DataTypes.STRING,
      network_id: DataTypes.INTEGER,
      contractId: DataTypes.INTEGER,
      transactionalTokenId: DataTypes.INTEGER,
      rewardTokenId: DataTypes.INTEGER,
      fundedAt: DataTypes.DATE,
      tags: DataTypes.ARRAY(DataTypes.STRING),
      chain_id: DataTypes.INTEGER,
      isDraft: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.state === "draft";
        }
      },
      isClosed: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.state === "closed";
        }
      },
      isCanceled: {
        type: DataTypes.VIRTUAL,
        get() {
          return this.state === "canceled";
        }
      },
      isFundingRequest: {
        type: DataTypes.VIRTUAL,
        get() {
          return BigNumber(this.fundingAmount).gt(0);
        }
      },
      isFunded: {
        type: DataTypes.VIRTUAL,
        get() {
          return BigNumber(this.fundedAmount).gte(this.fundingAmount);
        }
      },
      hasReward: {
        type: DataTypes.VIRTUAL,
        get() {
          return BigNumber(this.rewardAmount).gt(0);
        }
      },
      fundedPercent: {
        type: DataTypes.VIRTUAL,
        get() {
          return BigNumber(this.fundedAmount).dividedBy(this.fundingAmount).multipliedBy(100).toNumber();
        }
      },
      isKyc:{
        type: DataTypes.BOOLEAN,
        defaultValue: false
      },
      kycTierList:{
        type: DataTypes.ARRAY(DataTypes.INTEGER),
        default: []
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
