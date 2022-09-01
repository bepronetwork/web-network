import { useState } from "react";

import { useTranslation } from "next-i18next";

import LockedIcon from "assets/icons/locked-icon";

import Button from "components/button";
import Modal from "components/modal";

import { useAuthentication } from "contexts/authentication";

import useERC20 from "x-hooks/use-erc20";

export default function DeployERC20Modal({
  show,
  setClose,
  setERC20Address
}:{
  show: boolean
  setClose: () => void
  setERC20Address: (address: string) => void
}) {
  const { t } = useTranslation(["common", "change-token-modal", "custom-network"]);
  
  const [name, setName] = useState<string>('');
  const [symbol, setSymbol] = useState<string>('');
  const [cap, setCap] = useState<number>(0);
  const [isExecuting, setIsExecuting] = useState(false);

  const { handleDeployERC20Token } = useERC20();
  const { wallet } = useAuthentication();

  async function deployContract() {  
    try {
      if(!wallet?.address) return;  
      setIsExecuting(true);

      await handleDeployERC20Token(name, symbol, cap.toString(), wallet?.address)
      .then(token => setERC20Address(token.contractAddress))

      setDefaults();
      setClose();
    } catch (error) {
      console.log(error);
    } finally {
      setIsExecuting(false);
    }
  }

  function canSubmit() {
    return name.trim() !== "" && symbol.trim() !== "" && cap > 0 ;
  }

  function setDefaults() {
    setName("");
    setSymbol("");
    setCap(0)
    setIsExecuting(false);
  }

  function handleClose() {
    setDefaults();
    setClose();
  }

  return (
    <Modal 
      show={show} 
      onCloseClick={handleClose} 
      title={t("change-token-modal:title-erc20")} 
      titlePosition="center"
    >
      <div className="container">
        <p className="caption-small trans mb-2 text-center">
        {t("change-token-modal:description-erc20")} 
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
          <div className="col-12">
            <div className="form-group">
              <label 
                htmlFor="" 
                className="caption-small mb-2 text-gray"
              >
                {t("misc.cap")}
              </label>

              <input 
                type="number" 
                className="form-control rounded-4" 
                value={cap} 
                onChange={e => setCap(Number(e.target.value))} 
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