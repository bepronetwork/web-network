import React, {useEffect, useState} from 'react';
import dynamic from "next/dynamic";
import "swagger-ui-react/swagger-ui.css"
import axios from "axios";
import getConfig from "next/config";

const SwaggerUI = dynamic<{ spec: string; }>(import('swagger-ui-react'), { ssr: false });

export default function ApiDocPage() {
  const [spec, setSpec] = useState<string>();
  const {publicRuntimeConfig} = getConfig();

  useEffect(() => {
    axios.get(`${publicRuntimeConfig.urls.home}/openapi.yaml`)
      .then(d => {
        setSpec(d.data as string);
      })
      .catch(e => {
        console.error(`Failed to fetch spec`, e);
        setSpec('');
      });
  }, [])

  return <SwaggerUI spec={spec}></SwaggerUI>
}

