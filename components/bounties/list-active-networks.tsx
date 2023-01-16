import { useEffect, useState } from "react";

import { useTranslation } from "next-i18next";
import Link from "next/link";
import { useRouter } from "next/router";

import CardItem from "components/card-item";
import CustomContainer from "components/custom-container";

import { useAppState } from "contexts/app-state";

import { formatNumberToNScale } from "helpers/formatNumber";

import { Network } from "interfaces/network";

import useApi from "x-hooks/use-api";
import useNetworkTheme from "x-hooks/use-network-theme";

export default function ListActiveNetworks() {
  const { t } = useTranslation(["bounty"]);
  const [networks, setNetworks] = useState<Network[]>();
  const { searchActiveNetworks } = useApi();
  const { state } = useAppState();
  const router = useRouter();
  const { getURLWithNetwork } = useNetworkTheme();

  useEffect(() => {
    searchActiveNetworks({
      isClosed: false,
      isRegistered: true,
    })
      .then((data) => {
        data?.rows && setNetworks(data.rows);
      })
      .catch(console.log);
  }, []);

  return (
    <CustomContainer className="mb-3">
      <div className="d-flex mt-2 p-1 justify-content-between">
        <h4 className="mt-1">{t("most-active-networks")}</h4>
        <Link href={"/networks"}>
          <a
            target="_blank"
            className="text-decoration-none text-primary mt-2"
            rel="noreferrer"
          >
            {t("explore-all")}
          </a>
        </Link>
      </div>
      <div className="row mt-3">
        {networks &&
          networks?.map((network) => (
            <div className="col-md-4 mb-1" key={network.name}>
              <CardItem onClick={() => {
                router.push(getURLWithNetwork("/", {
                      network: network.name
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
                    <span className="caption-medium">{network.name}</span>
                    <div className="d-flex justify-content-between mt-2">
                      <span className="bg-dark-gray p-1 border-radius-8 px-2 me-1">
                        {formatNumberToNScale(network?.totalValueLock.toFixed(0),
                                              0) || 0}{" "}
                        <span className="text-uppercase text-white-40">
                          TVL
                        </span>
                      </span>
                      <span className="bg-dark-gray p-1 border-radius-8 px-2">
                        {network?.countIssues || 0}{" "}
                        <span className="text-uppercase text-white-40">
                          {t("label_other")}
                        </span>
                      </span>
                    </div>
                  </div>
                </div>
              </CardItem>
            </div>
          ))}
      </div>
    </CustomContainer>
  );
}
