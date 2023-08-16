import { useState } from "react";

import Button, { ButtonProps } from "components/button";
import WalletMismatchModal from "components/modals/wallet-mismatch/controller";

import { useAppState } from "contexts/app-state";
import { changeNeedsToChangeChain } from "contexts/reducers/change-spinners";
import { changeShowWeb3 } from "contexts/reducers/update-show-prop";

import { UNSUPPORTED_CHAIN } from "helpers/constants";
import { AddressValidator } from "helpers/validators/address";

export default function ContractButton({
  onClick,
  children,
  ...rest
}: ButtonProps) {
  const [isModalVisible, setIsModalVisible] = useState(false);

  const { state, dispatch } = useAppState();

  function onCloseModal() {
    setIsModalVisible(false);
  }

  async function validateEthereum() {
    if(window.ethereum) return true;

    dispatch(changeShowWeb3(true));

    return false;
  }

  async function validateChain() {
    if (state.connectedChain?.matchWithNetworkChain !== false && state.connectedChain?.name !== UNSUPPORTED_CHAIN)
      return true;

    dispatch(changeNeedsToChangeChain(true));

    return false;
  }

  async function validateWallet() {
    const web3Connection = state.Service?.web3Connection;
    const sessionWallet = state.currentUser?.walletAddress;

    if (!web3Connection || !sessionWallet) return false;

    const connectedWallet = await web3Connection.getAddress();

    const isSameWallet = AddressValidator.compare(sessionWallet, connectedWallet);

    if (isSameWallet) return true;

    setIsModalVisible(true);

    return false;
  }

  async function handleExecute(e) {
    try {
      if (!onClick)
        throw new Error("Missing onClick callback");

      const validations: (() => Promise<boolean>)[] = [
        validateEthereum,
        validateChain,
        validateWallet,
      ];

      for (const validation of validations) {
        const isValidated = await validation();
        
        if (!isValidated)
          throw new Error(validation.name)
      }

      onClick(e);
    } catch (error) {
      console.debug("Contract Button", error);
    }
  }

  return(
    <>
      <Button
        onClick={handleExecute}
        {...rest}
      >
        {children}
      </Button>

      <WalletMismatchModal
        show={isModalVisible}
        onClose={onCloseModal}
      />
    </>
  );
}