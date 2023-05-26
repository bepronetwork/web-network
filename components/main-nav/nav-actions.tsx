import { useTranslation } from "next-i18next";
import { useRouter } from "next/router";

import HamburgerIcon from "assets/icons/hamburger-icon";
import HelpIcon from "assets/icons/help-icon";
import PlusIcon from "assets/icons/plus-icon";

import Button from "components/button";
import ConnectWalletButton from "components/connect-wallet-button";
import InternalLink from "components/internal-link";
import MultiActionButton from "components/multi-action-button";
import NavAvatar from "components/nav-avatar";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";
import ResponsiveWrapper from "components/responsive-wrapper";
import TransactionsStateIndicator from "components/transactions-state-indicator";

interface NavActionsProps {
  onClickShowHelp: () => void;
  isOnNetwork: boolean;
}

export default function NavActions({
  isOnNetwork,
  onClickShowHelp,
} : NavActionsProps) {
  const { push } = useRouter();
  const { t } = useTranslation("common");

  const CreateBtn = () => 
  <ReadOnlyButtonWrapper>
    {
      isOnNetwork ?
        <InternalLink
          href={"/create-bounty"}
          icon={<PlusIcon />}
          label={t("main-nav.new-bounty") as string}
          iconBefore
          uppercase
        /> :
        <MultiActionButton
          label="Create"
          className="read-only-button"
          icon={<PlusIcon />}
          actions={[
            { label: "Bounty", onClick: () => push("/create-bounty") },
            { label: "Network", onClick: () => push("/new-network") },
          ]}
        />
    }
  </ReadOnlyButtonWrapper>;

  return(
    <>
      <div className="d-flex flex-row align-items-center gap-3">
        <ResponsiveWrapper
          xs={false}
          xl={true}
        >
          <div className="d-flex gap-3 align-items-center">
            <CreateBtn />

            <Button
              onClick={onClickShowHelp}
              className="bg-gray-850 border-gray-850 rounded p-2"
              transparent
            >
              <HelpIcon />
            </Button>
          </div>
        </ResponsiveWrapper>

        <ConnectWalletButton>
          <ResponsiveWrapper
            xs={false}
            xl={true}
          >
            <div className="d-flex gap-3 align-items-center">
              <TransactionsStateIndicator />

              <NavAvatar />
            </div>
          </ResponsiveWrapper>

          <ResponsiveWrapper
            xs={true}
            xl={false}
          >
            <div className="d-flex gap-3 align-items-center">
              <CreateBtn />

              <Button 
                className="p-0 not-svg"
                transparent
              >
                <HamburgerIcon />
              </Button>
            </div>
          </ResponsiveWrapper>
        </ConnectWalletButton>
      </div>
    </>
  );
}