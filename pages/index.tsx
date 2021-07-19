import React from "react";
import { GetStaticProps } from "next";
import PageDevelopers from "./developers";

export default function Home() {
  return <PageDevelopers />;
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
