import { ContextualSpan } from "components/contextual-span";
import NetworkColumns from "components/profile/network-columns";

export default function VotingPowerMultiNetwork() {
  return(
    <>
      <div className="mt-5">
        <ContextualSpan
          context="info"
          isAlert
        >
          <span>To manage your voting power you need to be in a especific network</span>
        </ContextualSpan>
      </div>

      <div className="mt-5">
      <NetworkColumns
        columns={["Network name", "Total votes", "Network link"]}
      />
      </div>
    </>
  );
}