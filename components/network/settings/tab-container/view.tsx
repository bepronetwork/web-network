import { ReactNode } from "react";

import { ContainerTab } from "components/profile/my-network-settings/container-tab";
import ReadOnlyButtonWrapper from "components/read-only-button-wrapper";

interface NetworkTabContainerProps {
  children?: ReactNode;
}

export default function NetworkTabContainer({
  children,
}: NetworkTabContainerProps) {
  return(
    <ReadOnlyButtonWrapper>
      <ContainerTab>
        {children}
      </ContainerTab>
    </ReadOnlyButtonWrapper>
  );
}