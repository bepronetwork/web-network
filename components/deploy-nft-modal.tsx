import { useState } from "react";

import { BountyToken } from "@taikai/dappkit";
import { useTranslation } from "next-i18next";

import LockedIcon from "assets/icons/locked-icon";

import Button from "components/button";
import Modal from "components/modal";

import { BeproService } from "services/bepro-service";

export default function DeployNFTModal({
  show,
  setClose,
  setNFTAddress
}:{
  show: boolean
  setClose: () => void
  setNFTAddress: (address: string) => void
}) {
  const { t } = useTranslation(["common", "change-token-modal"]);
  const [name, setName] = useState('');
  const [symbol, setSymbol] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);

  async function deployContract() {    
    try {
      setIsExecuting(true);

      const deployer = new BountyToken(BeproService.bepro);

      await deployer.loadAbi();

      const tx = await deployer.deployJsonAbi(name, symbol);

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
    setDefaults();
    setClose();
  }

  return (
    <Modal show={show} onCloseClick={handleClose} title="New NFT" titlePosition="center" >
      <div className="container">
        <p className="caption-small trans mb-2 text-center">
            Deploy a New NFT Token for your network
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

          <Button color="dark-gray" onClick={handleClose}>
            {t("actions.cancel")}
          </Button>
        </div>
      </div>
    </Modal>
  );
}