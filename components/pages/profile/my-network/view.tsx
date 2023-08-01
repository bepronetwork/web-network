import { Col } from "react-bootstrap";

import { useTranslation } from "next-i18next";

import NotFound from "components/common/not-found/view";
import MyNetworkSettings from "components/network/settings/controller";
import ProfileLayout from "components/profile/profile-layout";

import { Network } from "interfaces/network";

import { SearchBountiesPaginated } from "types/api";

interface MyNetworkPageViewProps {
  myNetwork: Network;
  bounties: SearchBountiesPaginated;
  updateEditingNetwork: () => Promise<void>;
}

export default function MyNetworkPageView({
  myNetwork,
  bounties,
  updateEditingNetwork,
}: MyNetworkPageViewProps) {
  const { t } = useTranslation(["common", "custom-network"]);

  return(
    <ProfileLayout>
      { !myNetwork &&
        <NotFound 
          message={t("custom-network:errors.you-dont-have-a-custom-network")}
          action={t("actions.create-one")}
          href="/new-network"
        />
      ||
        <Col xs={12}>
          <MyNetworkSettings
            bounties={bounties}
            network={myNetwork}
            updateEditingNetwork={updateEditingNetwork}
          />
        </Col>
      }
    </ProfileLayout>
  );
}