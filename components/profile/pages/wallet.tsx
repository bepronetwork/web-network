import {Col, Row} from "react-bootstrap";

import ProfileLayout from "components/profile/profile-layout";
import WalletBalance from "components/profile/wallet-balance";

export default function WalletPage() {
  return (
    <ProfileLayout>
      <Col xs={12}>
        <Row className="mb-3">
          <WalletBalance/>
        </Row>
      </Col>
    </ProfileLayout>
  );
}