import { formatNumberToNScale } from "helpers/formatNumber";

import Modal from "./modal";

export default function NotListedTokens({
  isVisible,
  handleClose,
  networks
}){
  return(
    <Modal show={isVisible} onCloseClick={handleClose} title="Not converted tokens" titlePosition="center">
      { networks?.map(network => (
        <div className="d-flex flex-row justify-content-between caption-small py-2">
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