"use strict";
const { getValueToLowerCase } = require("../../helpers/db/getters");
const { Model, DataTypes } = require("sequelize");
const DeliverableModel = require("./deliverable.model")
const ProposalModel = require("./mergeproposal");

class Comments extends Model {
  static init(sequelize) {
    super.init(
      {
        id: {
          type: DataTypes.INTEGER,
          autoIncrement: true,
          primaryKey: true,
          unique: true,
        },
        comment: {
          type: DataTypes.TEXT,
          allowNull: false,
        },
        hidden: {
          type: DataTypes.BOOLEAN,
          defaultValue: true,
        },
        type: {
          type: DataTypes.STRING,
          allowNull: false,
        },
        issueId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "issues",
            key: "id",
          },
        },
        proposalId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "merge_proposals",
            key: "id",
          },
        },
        deliverableId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "deliverables",
            key: "id",
          },
        },
        userId: {
          type: DataTypes.INTEGER,
          allowNull: false,
          references: {
            model: "users",
            key: "id",
          },
        },
        userAddress: {
          type: DataTypes.STRING,
          allowNull: false,
          get() {
            return getValueToLowerCase(this, "userAddress");
          },
        },
        replyId: {
          type: DataTypes.INTEGER,
          allowNull: true,
          references: {
            model: "issues",
            key: "id",
          },
        },
        createdAt: {
          allowNull: false,
          type: DataTypes.DATE,
        },
        updatedAt: {
          allowNull: false,
          type: DataTypes.DATE,
        },
      },
      {
        sequelize,
        validate: {
          async validateIssueId() {
            if (this.deliverableId) {
              const deliverable = await DeliverableModel.findOne({
                where: {
                  id: this.deliverableId,
                },
              });
              if (deliverable && deliverable?.issueId !== this.issueId) {
                throw new Error("Invalid Issue Id");
              }
            }

            if (this.proposalId) {
              const proposal = await ProposalModel.findOne({
                where: {
                  id: this.proposalId,
                },
              });
              if (proposal && proposal?.issueId !== this.issueId) {
                throw new Error("Invalid Issue Id");
              }
            }
          },
        },
        modelName: "comment",
        tableName: "comments",
      }
    );
  }

  static associate(models) {
    this.belongsTo(models.issue, {
      foreignKey: "issueId",
      sourceKey: "id",
      as: "issue",
    });

    this.belongsTo(models.deliverable, {
      foreignKey: "deliverableId",
      sourceKey: "id",
      as: "deliverable",
    });

    this.belongsTo(models.mergeProposal, {
      foreignKey: "proposalId",
      sourceKey: "id",
      as: "proposal",
    });

    this.belongsTo(models.user, {
      foreignKey: "userId",
      sourceKey: "id",
      as: "user",
    });

    this.belongsTo(models.user, {
      foreignKey: "replyId",
      sourceKey: "id",
      as: "reply",
    });
  }
}

module.exports = Comments;
