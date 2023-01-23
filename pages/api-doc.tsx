import React from 'react';
import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css"
import axios from "axios";
import getConfig from "next/config";

const SwaggerUI = dynamic<{ spec: Record<string, any>; }>(import('swagger-ui-react'), { ssr: false });

export const getStaticProps = async () => {
  const {publicRuntimeConfig} = getConfig();
  const spec =
    await
      axios.get(`${publicRuntimeConfig.home}/openapi.yaml`)
        .then(d => {
          return d.data;
        })
        .catch(e => {
          console.error(`Failed to fetch spec`, e);
          return '';
        });
  return {props: {spec}};
}

export default function ApiDocPage({spec}) {
  return <SwaggerUI spec={spec}></SwaggerUI>
}

