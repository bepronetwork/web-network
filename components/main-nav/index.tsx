import {useEffect, useState} from "react";

import clsx from "clsx";
import {useRouter} from "next/router";

import ClosedNetworkAlert from "components/closed-network-alert";
import HelpModal from "components/help-modal";
import BrandLogo from "components/main-nav/brand-logo";
import NavActions from "components/main-nav/nav-actions";
import NavLinks from "components/main-nav/nav-links";
import ResponsiveWrapper from "components/responsive-wrapper";
import SelectChainDropdown from "components/select-chain-dropdown";

import {useAppState} from "contexts/app-state";
import { changeCurrentUserHasRegisteredNetwork } from "contexts/reducers/change-current-user";

import { SupportedChainData } from "interfaces/supported-chain-data";

import useApi from "x-hooks/use-api";
import { useDao } from "x-hooks/use-dao";
import { useNetwork } from "x-hooks/use-network";
import useNetworkChange from "x-hooks/use-network-change";

export default function MainNav() {
  const { pathname, query, asPath, push } = useRouter();

  const [showHelp, setShowHelp] = useState(false);

  const { connect } = useDao();
  const { state } = useAppState();
  const { dispatch } = useAppState();
  const { searchNetworks } = useApi();
  const { getURLWithNetwork } = useNetwork();
  const { handleAddNetwork } = useNetworkChange();

  const noNeedNetworkInstance = !query?.network;

  const networkLogo = state.Service?.network?.active?.fullLogo;
  const fullLogoUrl = networkLogo && `${state.Settings?.urls?.ipfs}/${networkLogo}`;
  const brandHref = noNeedNetworkInstance ? "/" : getURLWithNetwork("/", {
    network: state.Service?.network?.active?.name,
  });

  useEffect(() => {
    if (!state.currentUser?.walletAddress || !state.connectedChain?.id)
      return;

    searchNetworks({
      creatorAddress: state.currentUser?.walletAddress,
      chainId: state.connectedChain?.id,
      isClosed: false
    })
      .then(({ count, rows }) => {
        const changeIfDifferent = (has: boolean) => state.currentUser?.hasRegisteredNetwork !== has &&
          dispatch(changeCurrentUserHasRegisteredNetwork(has));

        if (count === 0) changeIfDifferent(false);
        else changeIfDifferent(!!rows[0]?.isRegistered);
      })
      .catch(error => console.debug("Failed to get network address by wallet", error));
  }, [state.currentUser?.walletAddress, state.connectedChain]);

  function handleShowHelpModal() {
    setShowHelp(true);
  }

  async function handleNetworkSelected(chain: SupportedChainData) {
    if (noNeedNetworkInstance) {
      handleAddNetwork(chain)
        .then(() => {
          if (state.currentUser?.walletAddress) return;

          connect();
        })
        .catch(() => null);

      return;
    }

    const needsRedirect = ["bounty", "pull-request", "proposal"].includes(pathname.replace("/[network]/[chain]/", ""));
    const newPath = needsRedirect ? "/" : pathname;
    const newAsPath = needsRedirect ? `/${query.network}/${chain.chainShortName}` :
      asPath.replace(query.chain.toString(), chain.chainShortName);

    push(getURLWithNetwork(newPath, {
      ... needsRedirect ? {} : query,
      chain: chain.chainShortName
    }), newAsPath);
  }

  return (
    <div className="nav-container">
      <ClosedNetworkAlert
        isVisible={!noNeedNetworkInstance && state.Service?.network?.active?.isClosed}
      />

      <div className="main-nav d-flex flex-column justify-content-center">
        <div
          className={clsx([
            "d-flex flex-row align-items-center justify-content-between px-3",
            state.currentUser?.walletAddress ? "py-0" : "py-3"
          ])}
        >
          <div className="d-flex align-items-center gap-4">
            <div className="d-flex gap-3">
              <BrandLogo
                href={brandHref}
                logoUrl={fullLogoUrl}
                showDefaultBepro={noNeedNetworkInstance}
              />

              {!noNeedNetworkInstance &&
                <ResponsiveWrapper xs={false} xl={true}>
                  <SelectChainDropdown
                    onSelect={(chain) => handleNetworkSelected(chain)}
                    isOnNetwork={!noNeedNetworkInstance}
                    className="select-network-dropdown"
                  />
                </ResponsiveWrapper>
              }
            </div>

            <NavLinks />
          </div>

          <NavActions
            isOnNetwork={!noNeedNetworkInstance}
            onClickShowHelp={handleShowHelpModal}
          />

          <HelpModal show={showHelp} onCloseClick={() => setShowHelp(false)} />
        </div>
      </div>
    </div>
  );
}
