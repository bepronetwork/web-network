import { NewNetworkStepper } from "components/custom-network/new-network-stepper";

interface NetworkSetupProps { 
  isVisible?: boolean;
}

export function NetworkSetup({
  isVisible
} : NetworkSetupProps) {
  
  if (!isVisible)
    return <></>;

  return(
    <div className="content-wrapper border-top-0 px-2 py-2">
      <NewNetworkStepper />
    </div>
  );
}