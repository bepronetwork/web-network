import { useTranslation } from "next-i18next";
import Image from "next/image";

import CloseIcon from "assets/icons/close-icon";
import metamaskLogo from "assets/metamask.png";

import Avatar from "components/avatar";
import Button from "components/button";
import GithubImage from "components/github-image";

import { truncateAddress } from "helpers/truncate-address";

interface ConnectionButtonProps {
  type: "github" | "wallet";
  credential: string;
  connect: () => void;
}

function ConnectionButton({
  type,
  credential,
  connect
} : ConnectionButtonProps) {
  const { t } = useTranslation("profile");

  const ICONS = {
    github: credential ? <Avatar userLogin={credential} /> : <GithubImage width={28} height={28} opacity={1} />,
    wallet: <Image src={metamaskLogo} width={28} height={28} />
  };

  const LABELS = {
    github: "Github",
    wallet: "Wallet"
  };

  const CREDENTIALS = {
    github: credential ? credential : t("connect-github"),
    wallet: credential ? truncateAddress(credential) : t("connect-wallet")
  };

  const CLASSES_BUTTON = [
    "d-flex",
    "flex-row",
    "bg-dark-gray",
    "align-items-center",
    "p-3",
    "border",
    "border-dark-gray",
    "border-radius-8",
    ...credential ? [] : ["justify-content-center", "cursor-pointer", "border-primary-hover"]
  ];

  const handleConnect = () => credential ? undefined : connect();

  return(
    <div className="d-flex flex-column">
      <label className="caption-medium mb-2">{LABELS[type]}</label>

      <div className={CLASSES_BUTTON.join(" ")} onClick={handleConnect}>
          {ICONS[type]}
          <span className="ml-2 caption-large text-white font-weight-medium">{CREDENTIALS[type]}</span>
      </div>
    </div>
  );
}

export { ConnectionButton };