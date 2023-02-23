"use strict";

const UsersPayments = require("../models/user-payments");
const { Op } = require("sequelize");
const name = "remove-duplicated-payments-users-payment-table";

module.exports = {
  async up(queryInterface, Sequelize) {
    console.log("start:", name);

    UsersPayments.init(queryInterface.sequelize);

    const Payments = await UsersPayments.findAll({})
    
    const removedPayments = []
    for (const payment of Payments) {
        if(!removedPayments.includes(payment.id)){
            const duplicatesPayments = await UsersPayments.findAll({
                where: {
                    address: payment.address,
                    ammount: payment.ammount,
                    issueId: payment.issueId,
                    transactionHash: payment.transactionHash
                }
            })
            
            if(duplicatesPayments.length > 1){
                const needRemove = duplicatesPayments.map(({id}) => id).slice(1, duplicatesPayments.length)
                await UsersPayments.destroy({
                    where: { 
                        id: {
                          [Op.in]: needRemove
                        }
                      },
                })
               needRemove.map(id => removedPayments.push(id))
            }
        }
    }

    console.log(`${name} - Removed duplications users payments - number of removals:${removedPayments.length}`);
  },
};
