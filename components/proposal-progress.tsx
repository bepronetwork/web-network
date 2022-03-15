import { formatNumberToString } from "helpers/formatNumber";
import { handlePercentage } from "helpers/handlePercentage";
import useApi from "x-hooks/use-api";
import { GetStaticProps } from "next";
import React, { useEffect, useState } from "react";
import Avatar from "./avatar";

interface Item {
  githubLogin: string;
  address: string;
  oracles: string;
  percentage: number;
}
interface IProposalProgressProps {
  proposalAddress: string[];
  proposalAmount: number[];
  totalAmounts: number;
}

export default function ProposalProgress({
  proposalAddress = [],
  proposalAmount = [],
  totalAmounts,
}: IProposalProgressProps) {
  const { getUserOf } = useApi();
  const [items, setItems] = useState<Item[]>([]);

  function updateUsersAddresses() {
    if (proposalAddress?.length < 1 || proposalAmount?.length < 1) return;

    async function mapUser(address: string, i: number): Promise<Item> {
      const { githubLogin } = await getUserOf(address);
      const oracles = proposalAmount[i].toString();
      const percentage = handlePercentage(+oracles, +totalAmounts, 2);

      return { githubLogin, percentage, address, oracles };
    }

    Promise.all(proposalAddress?.map(mapUser)).then(setItems);
  }

  useEffect(updateUsersAddresses, [
    proposalAddress,
    proposalAmount,
    totalAmounts,
  ]);

  return (
    <div className="container bg-shadow p-2">
      <div className="d-flex justify-content-center align-items-center gap-2">
        {items.length > 0 &&
          React.Children.toArray(
            items.map((item, index) => (
              <div
                key={index}
                className={`rounded-bottom d-flex flex-column align-items-center gap-2`}
                style={{ width: `${item.percentage}%` }}
              >
                <Avatar key={index} userLogin={item.githubLogin} tooltip />

                <p className="caption-small">
                  {formatNumberToString(item.percentage, 2)}%
                </p>

                <span className="w-100 bg-primary p-1 rounded" />
              </div>
            ))
          )}
      </div>
    </div>
  );
}
