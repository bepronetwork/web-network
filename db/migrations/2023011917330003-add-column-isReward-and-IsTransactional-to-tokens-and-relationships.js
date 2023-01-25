"use strict";

const Tokens = require("../models/tokens.model");
const Issues = require("../models/issue.model");
const NetworkTokens = require("../models/network-tokens.model");
const name = "add-column-isReward-and-IsTransactional-to-tokens-and-relationships"

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log('start:', name)
    await queryInterface.addColumn("tokens", "isReward", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn("network_tokens", "isTransactional", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    await queryInterface.addColumn("network_tokens", "isReward", {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    });

    Tokens.init(queryInterface.sequelize);
    NetworkTokens.init(queryInterface.sequelize)

    const tokens = await Tokens.findAll();
    const removeTokens = []
    const handleFindTokens = (newId, oldId) => removeTokens.find(id => 
      (id.new === newId || id.old === newId) || (id.new === oldId || id.old === oldId)
    )

    for (const token of tokens) {
      const currentTokens = tokens.filter(t => t.address === token.address)
      
      if(currentTokens.length === 0) return;

      if(currentTokens.length === 1){
        token.isReward = token.isTransactional === false
        await token.save()

        await NetworkTokens.update({ 
          isTransactional: token.isTransactional,
          isReward: token.isTransactional === false
        }, { where: { tokenId: token.id }})

      }else if(!handleFindTokens(currentTokens[0].id, currentTokens[1].id) && currentTokens[0].isAllowed === true){
        removeTokens.push({new: currentTokens[0].id, old: currentTokens[1].id})

        if(currentTokens[0].isTransactional && currentTokens[1].isAllowed === true){
          currentTokens[0].isReward = currentTokens[1].isTransactional === false
          await currentTokens[0].save()

          await NetworkTokens.update({ 
            isTransactional: currentTokens[0].isTransactional,
            isReward: currentTokens[1].isTransactional === false
          }, { where: { tokenId: currentTokens[0].id }})

        }else if(currentTokens[1].isAllowed === true){
          currentTokens[0].isReward = true
          currentTokens[0].isTransactional = currentTokens[1].isTransactional
          await currentTokens[0].save()

          await NetworkTokens.update({ 
            isTransactional: currentTokens[1].isTransactional,
            isReward: true
          }, { where: { tokenId: currentTokens[0].id }})
          
        }
      }
    }

    Issues.init(queryInterface.sequelize);

    for(const id of removeTokens){
      console.log(`token to be changed: ${id.new} and token to be removed: ${id.old}`)
      await Issues.update({ tokenId: id.new }, { where: { tokenId: id.old }})

      await NetworkTokens.destroy({ where: { tokenId: id.old }})

      await Tokens.destroy({ where: { id: id.old }})
    }
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.removeColumn("tokens", "isReward");
    await queryInterface.removeColumn("network_tokens", "isTransactional");
    await queryInterface.removeColumn("network_tokens", "isReward");
  },
};
