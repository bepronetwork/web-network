import OpenGraphPreviewView from "components/open-graph-preview/view";

import { MINUTE_IN_MS } from "helpers/constants";
import { isValidUrl } from "helpers/validateUrl";

import getMetadata from "x-hooks/api/get-metadata";
import useReactQuery from "x-hooks/use-react-query";

interface OpenGgraphPreviewProps {
  url: string;
  showOpenLink?: boolean;
  previewPlaceholder?: string;
  openLinkText?: string;
}

export default function OpenGraphPreview({
  url,
  showOpenLink,
  previewPlaceholder,
  openLinkText,
}: OpenGgraphPreviewProps) {
  const { data, isFetching } = useReactQuery(["ogPreview", url], () => getMetadata({ url }), {
    enabled: !!url && isValidUrl(url),
    staleTime: MINUTE_IN_MS
  });

  const preview = data?.ogImage || data?.ogVideo;
  const isImage = data?.ogImage ? true : false;

  return(
    <OpenGraphPreviewView
      isFetching={isFetching}
      isImage={isImage}
      previewPlaceholder={previewPlaceholder}
      preview={preview}
      showOpenLink={showOpenLink}
      url={url}
      openLinkText={openLinkText}
    />
  );
}