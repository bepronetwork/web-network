import { Col, Row } from "react-bootstrap";

import { GetServerSideProps } from "next";
import { serverSideTranslations } from "next-i18next/serverSideTranslations";

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
    </ProfileLayout>
  );
}

export const getServerSideProps: GetServerSideProps = async ({ locale }) => {

  return {
    props: {
      ...(await serverSideTranslations(locale, [
        "common",
        "bounty",
        "my-oracles",
        "connect-wallet-button",
        "profile"
      ]))
    }
  };
};
