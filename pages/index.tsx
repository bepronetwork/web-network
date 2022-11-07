import {GetServerSideProps} from "next/types";
import getConfig from "next/config";

export default function () {}

export const getServerSideProps: GetServerSideProps = async ({ locale, query, res }) => {
  if (res) {
    if (!query?.slug) {
      const {publicRuntimeConfig} = getConfig();
      res.writeHead(302, {Location: `/${publicRuntimeConfig.defaultName}`});
      res.end();
      return {} as any;
    }
  }

  return {props: {}} as any;
}