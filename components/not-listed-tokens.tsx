import { useTranslation } from "next-i18next";

import { formatNumberToNScale } from "helpers/formatNumber";

import Modal from "./modal";

export default function NotListedTokens({
  isVisible,
  handleClose,
  networks
}){
  const { t } = useTranslation("custom-network");
  
  return(
    <Modal 
      show={isVisible} 
      onCloseClick={handleClose} 
      title={t("modals.not-listed-tokens.title")} 
      titlePosition="center"
    >
      { networks?.filter(network => network?.totalSettlerLocked > 0)?.map(network => (
        <div 
          className="d-flex flex-row justify-content-between caption-small py-2" 
          key={`${network?.tokenName}${network?.tokenSymbol}`}
        >
          <span>
            {network?.tokenName}
          </span>

          <span>
            {formatNumberToNScale(network?.totalSettlerLocked)} ${network?.tokenSymbol}
          </span>
        </div>
      )) }
    </Modal>
  );
}