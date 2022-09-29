import { useCallback, useEffect, useState, useContext } from "react";

import { TransactionReceipt } from "@taikai/dappkit/dist/src/interfaces/web3-core";

import { ApplicationContext } from "contexts/application";
import { useAuthentication } from "contexts/authentication";
import { useDAO } from "contexts/dao";
import { useNetwork } from "contexts/network";
import { addTransaction } from "contexts/reducers/add-transaction";
import { updateTransaction } from "contexts/reducers/update-transaction";

import { parseTransaction } from "helpers/transactions";

import { TransactionStatus } from "interfaces/enums/transaction-status";
import { TransactionTypes } from "interfaces/enums/transaction-types";
import { BlockTransaction } from "interfaces/transaction";

import useBepro from "x-hooks/use-bepro";

import useTransactions from "./useTransactions";

export default function useERC20() {
  const [balance, setBalance] = useState(0);
  const [name, setName] = useState<string>();
  const [decimals, setDecimals] = useState(18); 
  const [allowance, setAllowance] = useState(0);
  const [symbol, setSymbol] = useState<string>();
  const [address, setAddress] = useState<string>();

  const { wallet } = useAuthentication();
  const { service: DAOService } = useDAO();
  const { handleApproveToken } = useBepro();
  const { activeNetwork } = useNetwork();
  const txWindow = useTransactions();
  const { dispatch } = useContext(ApplicationContext);

  const logData = { 
    wallet: wallet?.address, 
    token: address, 
    network: DAOService?.network?.contractAddress 
  };

  const updateAllowanceAndBalance = useCallback(() => {
    if (!wallet?.address || !DAOService?.network?.contractAddress || !address) return;

    DAOService.getTokenBalance(address, wallet.address)
      .then(setBalance)
      .catch(error => console.debug("useERC20:getTokenBalance", logData, error));

    DAOService.getAllowance(address, wallet.address, DAOService.network.contractAddress)
      .then(setAllowance)
      .catch(error => console.debug("useERC20:getAllowance", logData, error));
  }, [wallet?.address, DAOService, address]);

  const approve = useCallback((amount: number) => {
    if (!wallet?.address || !DAOService || !address || !amount) return;

    return handleApproveToken(address, amount).then(updateAllowanceAndBalance);
  }, [wallet?.address, DAOService, address]);

  useEffect(() => {
    if (DAOService && address) 
      DAOService.getERC20TokenData(address)
        .then(({ name, symbol, decimals }) => {
          setName(name);
          setSymbol(symbol);
          setDecimals(decimals);
        })
        .catch(error => console.debug("useERC20:getERC20TokenData", logData, error));
        
    updateAllowanceAndBalance();
  }, [wallet?.address, DAOService, address]);

  async function handleDeployERC20Token(name: string, 
                                        symbol: string, 
                                        cap: string, 
                                        ownerAddress: string): Promise<TransactionReceipt> {
    return new Promise(async (resolve, reject) => {
      const transaction = addTransaction({ type: TransactionTypes.deployERC20Token }, activeNetwork);

      dispatch(transaction);

      await DAOService.deployERC20Token(name, symbol, cap, ownerAddress)
        .then((txInfo: TransactionReceipt) => {
          txWindow.updateItem(transaction.payload.id,  parseTransaction(txInfo, transaction.payload));
          resolve(txInfo);
        })
        .catch((err: { message: string; }) => {
          if (err?.message?.search("User denied") > -1)
            dispatch(updateTransaction({
              ...(transaction.payload as BlockTransaction),
              status: TransactionStatus.rejected
            }));
          else
            dispatch(updateTransaction({
              ...(transaction.payload as BlockTransaction),
              status: TransactionStatus.failed
            }));
          reject(err);
        });
    });
  }

  return {
    name,
    decimals,
    symbol,
    handleDeployERC20Token,
    allowance,
    balance,
    address,
    setAddress,
    approve,
    updateAllowanceAndBalance
  };
}
