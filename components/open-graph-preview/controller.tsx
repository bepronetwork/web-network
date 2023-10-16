import { useEffect } from "react";

import OpenGraphPreviewView from "components/open-graph-preview/view";

import { MINUTE_IN_MS } from "helpers/constants";
import { isValidUrl } from "helpers/validateUrl";

import getMetadata from "x-hooks/api/get-metadata";
import useReactQuery from "x-hooks/use-react-query";

interface OpenGgraphPreviewProps {
  url: string;
  showOpenLink?: boolean;
  previewPlaceholder?: string;
  errorPlaceholder?: string;
  openLinkText?: string;
  onStatusChange?: (status: string)=> void;
}

export default function OpenGraphPreview({
  url,
  showOpenLink,
  previewPlaceholder,
  errorPlaceholder,
  openLinkText,
  onStatusChange,
}: OpenGgraphPreviewProps) {
  const { 
    data,
    isError,
    isSuccess, 
    isFetching, 
    isLoading,
    isFetched 
  } = useReactQuery(["ogPreview", url], () => getMetadata({ url }), {
    enabled: !!url && isValidUrl(url),
    staleTime: MINUTE_IN_MS
  });

  const preview = data?.ogImage || data?.ogVideo;
  const isImage = data?.ogImage ? true : false;
  const noPreviewAvailable = isFetched && !data?.title;

  function getStatus() {
    if (isFetching || isLoading) return "loading";
    if (isSuccess && data) return "success";
    if (isError) return "error";
  }

  useEffect(() => {
    if (onStatusChange)
      onStatusChange(getStatus());
  }, [isError, isFetching, isSuccess, isFetched]);

  return(
    <OpenGraphPreviewView
      isFetching={isFetching}
      isImage={isImage}
      previewPlaceholder={previewPlaceholder}
      errorPlaceholder={errorPlaceholder}
      preview={preview}
      showOpenLink={showOpenLink}
      url={url}
      openLinkText={openLinkText}
      noPreviewAvailable={noPreviewAvailable}
      isError={isError}
    />
  );
}