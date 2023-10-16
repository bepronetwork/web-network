import { useTranslation } from "next-i18next";

import Modal from "components/modal";

import { useAppState } from "contexts/app-state";

import { truncateAddress } from "helpers/truncate-address";

interface WalletMismatchModalProps {
  show: boolean;
  onClose: () => void;
}

export default function WalletMismatchModal({
  show,
  onClose
}: WalletMismatchModalProps) {
  const { t } = useTranslation();

  const { state } = useAppState();

  const truncatedWallet = truncateAddress(state.currentUser?.walletAddress);

  return(
    <Modal
      centerTitle
      show={show}
      title={t("modals.wallet-mismatch.title")}
      onCloseClick={onClose}
    >
      <div className="mt-3">
        <p className="xs-medium text-gray text-center">
          <span>{t("modals.wallet-mismatch.description-pre")} </span>
          <span className="text-white">
            {truncatedWallet}
          </span>
          <span> {t("modals.wallet-mismatch.description-pos")}</span>
        </p>

        <p className="xs-medium text-gray text-center">
          {t("modals.wallet-mismatch.recommendation")}
        </p>
      </div>
    </Modal>
  );
}