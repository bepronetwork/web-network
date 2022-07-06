import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";
import Image from "next/image";

import metamaskLogo from "assets/metamask.png";

import Avatar from "components/avatar";
import AvatarOrIdenticon from "components/avatar-or-identicon";
import Badge from "components/badge";
import GithubImage from "components/github-image";
import ProfileLayout from "components/profile/profile-layout";

import { useAuthentication } from "contexts/authentication";

import { truncateAddress } from "helpers/truncate-address";


interface ConnectionButtonProps {
  type: "github" | "wallet";
  credential: string;
}

export default function Profile() {
  const { wallet, user, connectWallet, connectGithub } = useAuthentication();

  const addressOrUsername = user?.login ? user.login : truncateAddress(wallet?.address);

  const ConnectionButton = ({
    type,
    credential
  } : ConnectionButtonProps) => {
    const ICONS = {
      github: credential ? <Avatar userLogin={credential} /> : <GithubImage width={28} height={28} opacity={1} />,
      wallet: <Image src={metamaskLogo} width={28} height={28} />
    };

    const LABELS = {
      github: "Github",
      wallet: "Wallet"
    };

    const CREDENTIALS = {
      github: credential ? credential : "Connect Github",
      wallet: credential ? truncateAddress(credential) : "Connect Wallet"
    };

    const ACTIONS = {
      github: credential ? undefined : connectGithub,
      wallet: credential ? undefined : connectWallet,
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

    return(
      <div className="d-flex flex-column">
        <label className="caption-medium mb-2">{LABELS[type]}</label>

        <div className={CLASSES_BUTTON.join(" ")} onClick={ACTIONS[type]}>
          {ICONS[type]}
          <span className="ml-2 caption-large text-white font-weight-normal">{CREDENTIALS[type]}</span>
        </div>
      </div>
    );
  }
  
  return(
    <ProfileLayout>
      <div className="row mb-5">
        <div className="col">
          <AvatarOrIdenticon user={user?.login} address={wallet?.address} size="lg" withBorder />
          
          <div className="d-flex flex-row mt-3 align-items-center">
            <h4 className="text-gray text-uppercase mr-2">{addressOrUsername}</h4>
            
            { wallet?.isCouncil && 
              <Badge 
                label="Council" 
                color="purple-30" 
                className="caption border border-purple text-purple border-radius-8" 
              /> 
            }
          </div>
        </div>
      </div>

      <div className="row mb-3">
        <span className="caption text-gray">Connections</span>
      </div>

      <div className="row">
        <div className="col-4">
          <ConnectionButton type="github" credential={user?.login} />
        </div>

        <div className="col-4">
          <ConnectionButton type="wallet" credential={wallet?.address} />
        </div>
      </div>
    </ProfileLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {

  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "proposal",
        "pull-request",
        "connect-wallet-button"
      ]))
    }
  };
};
