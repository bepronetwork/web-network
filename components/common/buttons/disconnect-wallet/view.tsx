import { useTranslation } from "next-i18next";

import SignOutIcon from "assets/icons/sign-out";

interface DisconnectWalletButtonProps {
  onClick: () => void;
}

export default function DisconnectWalletButton({
  onClick
}: DisconnectWalletButtonProps) {
  const { t } = useTranslation("common");
  
  return(
    <div
      className="d-flex flex-row align-items-center justify-content-between pt-3 pb-1 px-0 cursor-pointer text-danger"
      onClick={onClick}
      role="button"
    >
      <span className="caption-medium text-capitalize family-Regular font-weight-medium">
        {t("main-nav.nav-avatar.disconnect-wallet")}
      </span>
      <SignOutIcon width={16} height={16} color="" />
    </div>
  );
}