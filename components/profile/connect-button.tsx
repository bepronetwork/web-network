import { useTranslation } from "next-i18next";
import Image from "next/image";

import metamaskLogo from "assets/metamask.png";

import Avatar from "components/avatar";
import GithubImage from "components/github-image";
import If from "components/If";

import { truncateAddress } from "helpers/truncate-address";

interface ConnectionButtonProps {
  type: "github" | "wallet";
  credential: string;
  variant?: "profile" | "connect-account";
  state?: "success" | "danger";
  isLoading?: boolean,
  isDisabled?: boolean,
  connect: () => void;
}

function ConnectionButton({
  type,
  credential,
  variant = "profile",
  state,
  isLoading = false,
  isDisabled = false,
  connect
} : ConnectionButtonProps) {
  const { t } = useTranslation(["profile", "common"]);

  const COLORS = {
    profile: "dark-gray",
    "connect-account": "dark"
  }

  const ICONS = {
    github: credential ? <Avatar userLogin={credential} /> : <GithubImage width={28} height={28} opacity={1} />,
    wallet: <Image src={metamaskLogo} width={28} height={28} />
  };

  const LABELS = {
    github: t("common:misc.github"),
    wallet: t("common:misc.wallet")
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
    ...credential ? [] : ["justify-content-center", "cursor-pointer", "border-primary-hover"],
    ...(isDisabled || isLoading)?  ["pe-none", "trans"] : [],
  ];

  const handleConnect = () => {
    if (credential) return undefined;
    else
      try {
        return connect();
      } catch (err) {
        console.debug("handleConnect error:", err);
      }
  };

  return(
    <div className="d-flex flex-column">
      <If condition={variant === "profile"}>
        <label className="caption-medium mb-2">{LABELS[type]}</label>
      </If>

      <div className={CLASSES_BUTTON.join(" ")} onClick={handleConnect}>
        {ICONS[type]}

        <span className="text-truncate ml-2 caption-large text-white font-weight-medium flex-grow-1">
          {CREDENTIALS[type]}
        </span>

        <If condition={isLoading}>
          <span className="spinner-border spinner-border-xs ml-1" />
        </If>
      </div>
    </div>
  );
}

export { ConnectionButton };