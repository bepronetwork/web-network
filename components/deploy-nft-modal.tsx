import { useState } from "react";

import { useTranslation } from "next-i18next";

import LockedIcon from "assets/icons/locked-icon";

import Button from "components/button";
import Modal from "components/modal";

import useBepro from "x-hooks/use-bepro";

export default function DeployNFTModal({
  show,
  setClose,
  setNFTAddress
}:{
  show: boolean
  setClose: () => void
  setNFTAddress: (address: string) => void
}) {
  const { t } = useTranslation(["common", "change-token-modal", "custom-network"]);
  
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  const { handleDeployBountyToken } = useBepro();

  async function deployContract() {    
    try {
      setIsExecuting(true);

      const tx = await handleDeployBountyToken(name, symbol);

      setNFTAddress(tx.contractAddress);
      setDefaults();
      setClose();
    } catch (error) {
      console.log(error);
    } finally {
      setIsExecuting(false);
    }
  }

  function canSubmit() {
    return name.trim() !== "" && symbol.trim() !== "";
  }

  function setDefaults() {
    setName("");
    setSymbol("");
    setIsExecuting(false);
  }

  function handleClose() {
    if(!isExecuting){
      setDefaults();
      setClose();
    }
  }

  return (
    <Modal 
      show={show} 
      onCloseClick={handleClose} 
      title={t("custom-network:modals.deploy-nft-token.title")} 
      titlePosition="center"
    >
      <div className="container">
        <p className="caption-small trans mb-2 text-center">
          {t("custom-network:modals.deploy-nft-token.description")}
        </p>

        <div className="row">
          <div className="col-6">
            <div className="form-group">
              <label 
                htmlFor="" 
                className="caption-small mb-2 text-gray"
              >
                {t("change-token-modal:fields.name.label")}
              </label>
              
              <input 
                type="text" 
                className="form-control rounded-4" 
                value={name} 
                onChange={e => setName(e.target.value)} 
              />
            </div>
          </div>

          <div className="col-6">
            <div className="form-group">
              <label 
                htmlFor="" 
                className="caption-small mb-2 text-gray"
              >
                {t("change-token-modal:fields.symbol.label")}
              </label>

              <input 
                type="text" 
                className="form-control rounded-4" 
                value={symbol} 
                onChange={e => setSymbol(e.target.value)} 
              />
            </div>
          </div>
        </div>

        <div className="d-flex pt-2 justify-content-center">
          <Button
            className="mr-2"
            disabled={!canSubmit() || isExecuting}
            onClick={deployContract}
          >
            {(!canSubmit()  && !isExecuting) && (
              <LockedIcon />
            )}
            <span>{t("actions.confirm")}</span>
            {isExecuting ? (
              <span className="spinner-border spinner-border-xs ml-1" />
            ) : (
              ""
            )}
          </Button>

          <Button color="dark-gray" disabled={isExecuting} onClick={handleClose}>
            {t("actions.cancel")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}