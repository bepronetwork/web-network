import { useTranslation } from "next-i18next";
import Image from "next/image";

import CheckMarkIcon from "assets/icons/checkmark-icon";
import ErrorMarkIcon from "assets/icons/errormark-icon";
import metamaskLogo from "assets/metamask.png";

import Avatar from "components/avatar";
import GithubImage from "components/github-image";

import { truncateAddress } from "helpers/truncate-address";

interface ConnectionButtonProps {
  type: "github" | "wallet";
  credential: string;
  variant?: "profile" | "connect-account";
  state?: "success" | "danger";
  connect: () => void;
}

function ConnectionButton({
  type,
  credential,
  variant = "profile",
  state,
  connect
} : ConnectionButtonProps) {
  const { t } = useTranslation("profile");

  const COLORS = {
    profile: "dark-gray",
    "connect-account": "dark"
  }

  const ICONS = {
    github: credential ? <Avatar userLogin={credential} /> : <GithubImage width={28} height={28} opacity={1} />,
    wallet: <Image src={metamaskLogo} width={28} height={28} />
  };

  const STATE_ICON = {
    success: <CheckMarkIcon />,
    danger: <ErrorMarkIcon />
  }

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
    `bg-${COLORS[variant]}`,
    "align-items-center",
    "p-3",
    "border",
    `border-${state || COLORS[variant]}`,
    "border-radius-8",
    ...credential ? [] : ["justify-content-center", "cursor-pointer", "border-primary-hover"]
  ];

  const handleConnect = () => credential ? undefined : connect();

  return(
    <div className="d-flex flex-column">
      { variant === "profile" && <label className="caption-medium mb-2">{LABELS[type]}</label> }

      <div className={CLASSES_BUTTON.join(" ")} onClick={handleConnect}>
          
            {ICONS[type]}
            <span className="ml-2 caption-large text-white font-weight-medium flex-grow-1">{CREDENTIALS[type]}</span>
          
          {STATE_ICON[state]}
      </div>
    </div>
  );
}

export { ConnectionButton };