import { useAppState } from "contexts/app-state";

export default function ReadOnlyContainer({ children }) {
  const { state } = useAppState();

  return(
    <div className={`${state.Service?.network?.active?.isClosed ? "read-only-network" : ""}`}>
      {children}
    </div>
  );
}