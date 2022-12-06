"use strict";
const { Model, DataTypes } = require("sequelize");

class KycSession extends Model {
  static init(sequelize) {
    super.init({
        user_id: DataTypes.INTEGER,
        session_id: DataTypes.STRING,
        tier:{
          type:  DataTypes.INTEGER,
          allowNull: false,
        },
        state: {
          type: DataTypes.STRING,
        },
        validatedAt: {
          allowNull: true,
          type: DataTypes.DATE,
        }
    },
               {
        sequelize,
        modelName: "kycSession",
        tableName: "kyc_sessions"
               });
  }

  static associate(models) {
   
  }
}

module.exports = KycSession;
