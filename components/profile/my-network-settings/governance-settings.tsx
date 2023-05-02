import { useEffect, useState } from "react";
import { Col, Row } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import ContractButton from "components/contract-button";
import NetworkContractSettings from "components/custom-network/network-contract-settings";
import TokensSettings from "components/profile/my-network-settings/tokens-settings";

import { useAppState } from "contexts/app-state";
import { useNetworkSettings } from "contexts/network-settings";
import { toastError, toastSuccess } from "contexts/reducers/change-toaster";

import { IM_AM_CREATOR_NETWORK } from "helpers/constants";

import { StandAloneEvents } from "interfaces/enums/events";
import { Network } from "interfaces/network";
import { Token } from "interfaces/token";

import useApi from "x-hooks/use-api";
import { useAuthentication } from "x-hooks/use-authentication";
import useBepro from "x-hooks/use-bepro";
import { useNetwork } from "x-hooks/use-network";

interface GovernanceProps {
  address: string;
  tokens: Token[];
  network: Network;
  updateEditingNetwork: () => void;
}

export default function GovernanceSettings({
  network,
  tokens,
  address,
  updateEditingNetwork
}: GovernanceProps) {
  const { t } = useTranslation(["common", "custom-network"]);

  const [isClosing, setIsClosing] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [networkToken, setNetworkToken] = useState<Token[]>();
  
  const {state, dispatch} = useAppState();
  const { updateActiveNetwork } = useNetwork();
  const { updateNetwork, processEvent } = useApi();
  const { updateWalletBalance, signMessage } = useAuthentication();
  const { handleCloseNetwork, handleChangeNetworkParameter } = useBepro();
  const {
    settings,
    tokens: settingsTokens,
    isAbleToClosed,
    forcedNetwork,
  } = useNetworkSettings();

  const isCurrentNetwork = (!!network &&
    !!state.Service?.network?.active &&
    network?.networkAddress === state.Service?.network?.active?.networkAddress)

  function handleCloseMyNetwork() {
    if (
      !state.Service?.network?.active ||
      !state.currentUser?.login ||
      !state.currentUser?.accessToken ||
      !state.currentUser?.walletAddress ||
      !state.Service?.active
    )
      return;

    setIsClosing(true);

    handleCloseNetwork()
      .then(() => {
        return signMessage(IM_AM_CREATOR_NETWORK).then(async () => updateNetwork({
          githubLogin: state.currentUser.login,
          isClosed: true,
          creator: state.currentUser.walletAddress,
          networkAddress: network?.networkAddress,
          accessToken: state.currentUser?.accessToken,
        }))
      })
      .then(() => {
        updateWalletBalance(true);

        if (isCurrentNetwork) updateActiveNetwork(true);

        return updateEditingNetwork();
      })
      .then(() =>
        dispatch(toastSuccess(t("custom-network:messages.network-closed"),
                              t("actions.success"))))
      .catch((error) =>
        dispatch(toastError(t("custom-network:errors.failed-to-close-network", { error }),
                            t("actions.failed"))))
      .finally(() => {
        setIsClosing(false);
      });
  }

  async function handleSubmit() {
    if (
      !state.currentUser?.walletAddress ||
      !state.Service?.active ||
      !forcedNetwork ||
      forcedNetwork?.isClosed ||
      isClosing
    )
      return;

    setIsUpdating(true);

    const {
      parameters: {
        draftTime: { value: draftTime },
        disputableTime: { value: disputableTime },
        councilAmount: { value: councilAmount },
        percentageNeededForDispute: { value: percentageForDispute },
      },
    } = settings;

    const networkAddress = network?.networkAddress;
    const failed = [];
    const success = {};

    const promises = await Promise.allSettled([
      ...(draftTime !== forcedNetwork.draftTime
        ? [
            handleChangeNetworkParameter("draftTime",
                                         draftTime,
                                         networkAddress)
              .then(() => ({ param: "draftTime", value: draftTime })),
        ]
        : []),
      ...(disputableTime !== forcedNetwork.disputableTime
        ? [
            handleChangeNetworkParameter("disputableTime",
                                         disputableTime,
                                         networkAddress)
              .then(() => ({ param: "disputableTime", value: disputableTime })),
        ]
        : []),
      ...(councilAmount !== +forcedNetwork.councilAmount
        ? [
            handleChangeNetworkParameter("councilAmount",
                                         councilAmount,
                                         networkAddress)
              .then(() => ({ param: "councilAmount", value: councilAmount })),
        ]
        : []),
      ...(percentageForDispute !== forcedNetwork.percentageNeededForDispute
        ? [
            handleChangeNetworkParameter("percentageNeededForDispute",
                                         percentageForDispute,
                                         networkAddress)
              .then(() => ({ param: "percentageNeededForDispute", value: percentageForDispute })),
        ]
        : []),
    ]);

    promises.forEach((promise) => {
      if (promise.status === "fulfilled") success[promise.value.param] = promise.value.value;
      else failed.push(promise.reason);
    });

    if (failed.length) {
      dispatch(toastError(t("custom-network:errors.updated-parameters", {
            failed: failed.length,
      }),
                          t("custom-network:errors.updating-values")));
      console.error(failed);
    }

    const successQuantity = Object.keys(success).length;

    if (successQuantity) {
      if(draftTime !== forcedNetwork.draftTime)
        Promise.all([
          await processEvent(StandAloneEvents.UpdateBountiesToDraft),
          await processEvent(StandAloneEvents.BountyMovedToOpen)
        ]);

      await processEvent(StandAloneEvents.UpdateNetworkParams)
        .catch(error => console.debug("Failed to update network parameters", error));

      dispatch(toastSuccess(t("custom-network:messages.updated-parameters", {
          updated: successQuantity,
          total: promises.length,
      })));
    }

    const json = {
      creator: state.currentUser.walletAddress,
      githubLogin: state.currentUser.login,
      networkAddress: network.networkAddress,
      accessToken: state.currentUser.accessToken,
      allowedTokens: {
       transactional: settingsTokens?.allowedTransactions?.map((token) => token?.id).filter((v) => v),
       reward: settingsTokens?.allowedRewards?.map((token) => token?.id).filter((v) => v)
      }
    };

    const handleError = (error) => {
      dispatch(toastError(t("custom-network:errors.failed-to-update-network", { error }),
                          t("actions.failed")));
      console.log(error);
    }

    signMessage(IM_AM_CREATOR_NETWORK)
      .then(async () => {
        await updateNetwork(json)
          .then(async () => {
            if (isCurrentNetwork) updateActiveNetwork(true);

            return updateEditingNetwork();
          })
          .then(() => {
            dispatch(toastSuccess(t("custom-network:messages.refresh-the-page"),
                                  t("actions.success")));
          })
          .catch(handleError);
      })
      .catch(handleError)
      .finally(() => setIsUpdating(false));
  }

  useEffect(() => {
    if(tokens.length > 0) setNetworkToken(tokens.map((token) => ({
      ...token,
      isReward: !!token.network_tokens.isReward,
      isTransactional: !!token.network_tokens.isTransactional
    })));
  }, [tokens]);

  return (
    <>
      <Row className="mt-4">
        <Col>
          <span className="caption-large text-white text-capitalize font-weight-medium mb-3">
            {t("custom-network:network-info")}
          </span>
        </Col>

        <Col xs="auto">
          <ContractButton
            className="border-radius-4"
            disabled={!settings?.validated || isUpdating || forcedNetwork?.isClosed || isClosing}
            onClick={handleSubmit}
          >
            {t("misc.save-changes")}
          </ContractButton>
        </Col>
      </Row>

      <Row className="mt-1">
        <Col>
          <label className="caption-small mb-2">
            {t("custom-network:network-address")}
          </label>
          <input
            type="text"
            className="form-control"
            value={address}
            disabled={true}
          />
        </Col>
        <Col className="d-flex align-items-center justify-content-end">
          <ContractButton
            color="dark-gray"
            disabled={!isAbleToClosed || isClosing || !state.currentUser?.login}
            className="ml-2 border-radius-4"
            onClick={handleCloseMyNetwork}
            isLoading={isClosing}
          >
            <span>{t("custom-network:close-network")}</span>
          </ContractButton>
        </Col>
      </Row>
      <Row className="mt-4">
       <TokensSettings defaultSelectedTokens={networkToken} />
      </Row>
      <Row className="mt-4">
        <span className="caption-medium text-white mb-3">
          {t("custom-network:steps.network-settings.fields.other-settings.title")}
        </span>

        <NetworkContractSettings />
      </Row>
    </>
  );
}
