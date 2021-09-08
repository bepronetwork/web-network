import SearchIcon from "@assets/icons/search-icon";
import { GetStaticProps } from "next";
import React, { ReactNode } from "react";

type NothingFoundProps = {
  description: string;
  children: ReactNode;
}

export default function NothingFound({ description, children }: NothingFoundProps) {
  return (
      <div className="d-flex flex-column align-items-center gap-4">
        <SearchIcon />
        <p className="text-center text-uppercase fw-bold mb-0">{description}</p>
        { children }
      </div>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  return {
    props: {},
  };
};
