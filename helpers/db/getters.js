const { Model } = require("sequelize");

/**
 * 
 * @param {Model} node 
 * @param {string} dataValue 
 * @returns {string | null} value
 */
function getValueToLowerCase(node, dataValue) {
  const rawValue = node.getDataValue(dataValue);
  return rawValue ? rawValue.toLowerCase() : null;
}

module.exports = {
  getValueToLowerCase
};