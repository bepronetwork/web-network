import { Sequelize } from "sequelize";

export const caseInsensitiveEqual = (colName: string, value: string) => 
  Sequelize.where(Sequelize.fn("lower", Sequelize.col(colName)), value?.toLowerCase());