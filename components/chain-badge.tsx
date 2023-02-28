import Badge from "components/badge";

import { SupportedChainData } from "interfaces/supported-chain-data";

interface ChainBadgeProps {
  chain: SupportedChainData;
}

export default function ChainBadge({ chain } : ChainBadgeProps) {
  return(
    <Badge
      label={chain?.chainShortName}
      className="small-info"
      style={{
        backgroundColor: `${chain?.color}90`
      }}
    />
  );
}