"use strict";

const Tokens = require("../models/tokens.model");
const Issues = require("../models/issue.model");
const NetworkTokens = require("../models/network-tokens.model");
const name = "add-column-isReward-to-tokens"

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('start:', name)
    await queryInterface.addColumn("tokens", "isReward", {
      type: Sequelize.BOOLEAN,
      allowNull: true,
      defaultValue: false,
    });

    Tokens.init(queryInterface.sequelize);
    
    const tokens = await Tokens.findAll();
    const removeTokens = []
    const handleFindTokens = (newId, oldId) => removeTokens.find(id => 
      (id.new === newId || id.old === newId) || (id.new === oldId || id.old === oldId)
    )

    for (const token of tokens) {
      const currentTokens = tokens.filter(t => t.address === token.address && t.isAllowed === true)
      
      if(currentTokens.length === 1){
        token.isReward = token.isTransactional === false
        await token.save()
      }else if(!handleFindTokens(currentTokens[0].id, currentTokens[1].id)){
        removeTokens.push({new: currentTokens[0].id, old: currentTokens[1].id})
        if(currentTokens[0].isTransactional){
          currentTokens[0].isReward = currentTokens[1].isTransactional === false
          await currentTokens[0].save()
        }else{
          currentTokens[0].isReward = true
          currentTokens[0].isTransactional = currentTokens[1].isTransactional
          await currentTokens[0].save()
        }
      }
    }

    Issues.init(queryInterface.sequelize);
    NetworkTokens.init(queryInterface.sequelize)

    for(const id of removeTokens){
      console.log(`token to be changed: ${id.new} and token to be removed: ${id.old}`)
      await Issues.update({ tokenId: id.new }, { where: { tokenId: id.old }})
      await NetworkTokens.update({ tokenId: id.new }, { where: { tokenId: id.old }})
      await Tokens.destroy({ where: { id: id.old }})
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("tokens", "isReward");
  },
};
