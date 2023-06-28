import { Sequelize } from "sequelize";

export const caseInsensitiveEqual = (colName: string, value: string) => 
  Sequelize.where(Sequelize.fn("lower", Sequelize.col(colName)), value?.toLowerCase());

export const caseLiteral = (colName, then, elseValue) => 
  Sequelize.literal(`CASE WHEN ${colName} = TRUE THEN ${then} ELSE ${elseValue} END`)