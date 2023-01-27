import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";

import LoadingList from "components/bounties/loading-list";
import CardItem from "components/card-item";
import ChainBadge from "components/chain-badge";
import CustomContainer from "components/custom-container";
import NothingFound from "components/nothing-found";

import { useAppState } from "contexts/app-state";

import { formatNumberToNScale } from "helpers/formatNumber";

import { Network } from "interfaces/network";

import useApi from "x-hooks/use-api";
import { useNetwork } from "x-hooks/use-network";

export default function ListActiveNetworks() {
  const router = useRouter();
  const { t } = useTranslation(["bounty"]);

  const [networks, setNetworks] = useState<Network[]>();
  const [loading, setLoading] = useState<boolean>(false);
  
  const { state } = useAppState();
  const { searchActiveNetworks } = useApi();
  const { getURLWithNetwork } = useNetwork();

  useEffect(() => {
    setLoading(true);
    searchActiveNetworks({
      isClosed: false,
      isRegistered: true,
      name: router.query?.network?.toString()
    })
      .then((data) => {
        data?.rows && setNetworks(data.rows);
      })
      .catch(console.log).finally(() => setLoading(false))
  }, [router.query?.network]);

  return (
    <CustomContainer className="mb-3">
      <div className="d-flex mt-2 p-1 justify-content-between">
        <h4 className="mt-1">{t("most-active-networks")}</h4>
        <Link href={"/networks"}>
          <a
            className="text-decoration-none text-primary mt-2"
            rel="noreferrer"
          >
            {t("explore-all")}
          </a>
        </Link>
      </div>
      <LoadingList  loading={loading} />
      <div className="row mt-3">
        {networks &&
          networks?.map((network) => (
            <div className="col-md-4 mb-1" key={`${network.name}-${network.chain.chainShortName}`}>
              <CardItem onClick={() => {
                router.push(getURLWithNetwork("/", {
                      network: network.name,
                      chain: network.chain.chainShortName
                }));
              }}>
                <div className="row">
                  <div className="col-2 mt-2 me-2">
                    {network?.logoIcon && (
                      <img
                        src={`${state.Settings?.urls?.ipfs}/${network?.logoIcon}`}
                        width={40}
                        height={40}
                      />
                    )}
                  </div>

                  <div className="col">
                    <div className="d-flex flex-row align-items-center gap-3">
                      <span className="caption-medium">{network.name}</span>
                    
                      <ChainBadge chain={network.chain} />
                    </div>
                    <div className="d-flex justify-content-between mt-2">
                      <span className="bg-dark-gray p-1 border-radius-8 px-2 me-1">
                        {formatNumberToNScale(network?.totalValueLock.toFixed(0),
                                              0) || 0}{" "}
                        <span className="text-uppercase text-white-40">
                          TVL
                        </span>
                      </span>
                      <span className="bg-dark-gray p-1 border-radius-8 px-2">
                        {network?.totalIssues || 0}{" "}
                        <span className="text-uppercase text-white-40">
                          {t("label", { count: network?.countIssues || 0 })}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </CardItem>
            </div>
          ))}
        {networks?.length === 0 && <NothingFound description={t("most-active-network-empty")}/>}
      </div>
    </CustomContainer>
  );
}
