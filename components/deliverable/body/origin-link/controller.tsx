import { useEffect, useState } from "react";

import { metadata } from "interfaces/metadata";

import getMetadata from "x-hooks/api/get-metadata";

import DeliverableOriginLinkView from "./view";

export default function DeliverableOriginLink({ url }: { url: string }) {
  const [previewLink, setPreviewLink] = useState<metadata>();
  const [previewIsLoading, setPreviewIsLoading] = useState<boolean>(false);

  useEffect(() => {
    if (url) {
      setPreviewIsLoading(true);
      getMetadata({
        url,
      })
        .then(setPreviewLink)
        .finally(() => setPreviewIsLoading(false));
    }
  }, [url]);

  return (
    <DeliverableOriginLinkView
      url={url}
      previewLink={previewLink}
      previewIsLoading={previewIsLoading}
    />
  );
}
