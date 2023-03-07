import {useRouter} from "next/router";

import { useAppState } from "contexts/app-state";

export default function ReadOnlyContainer({ children }) {
  const { state } = useAppState();
  const { pathname } = useRouter();

  const isOnNetwork = pathname?.includes("[network]");

  return(
    <div className={`${state.Service?.network?.active?.isClosed && isOnNetwork ? "read-only-network" : ""}`}>
      {children}
    </div>
  );
}