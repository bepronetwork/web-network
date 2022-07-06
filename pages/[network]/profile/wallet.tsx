import { Col, Row } from "react-bootstrap";

import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

import OraclesActions from "components/oracles-actions";
import OraclesDelegate from "components/oracles-delegate";
import OraclesTakeBack from "components/oracles-take-back";
import ProfileLayout from "components/profile/profile-layout";
import WalletBalance from "components/profile/wallet-balance";

export default function Wallet() {
  return(
    <ProfileLayout>
      <Col xs={10}>
        <Row className="mb-3">
          <WalletBalance />
        </Row>
      </Col>

      <Row className="mb-4">
        <OraclesActions />

        <OraclesDelegate />
      </Row>

      <Row>
        <OraclesTakeBack />
      </Row>
    </ProfileLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {

  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "my-oracles",
        "connect-wallet-button"
      ]))
    }
  };
};
