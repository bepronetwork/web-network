import getConfig from "next/config";

import NetworkLogoAndColorsSettingsView from "components/network/settings/logo-and-colors/view";

import { useNetworkSettings } from "contexts/network-settings";

import { getQueryableText, urlWithoutProtocol } from "helpers/string";

import { Network } from "interfaces/network";

const { publicRuntimeConfig } = getConfig();

interface NetworkLogoAndColorsSettingsProps {
  network: Network;
  errorBigImages: boolean;
}

export default function NetworkLogoAndColorsSettings({
  network,
  errorBigImages
}: NetworkLogoAndColorsSettingsProps) {
  const {
    details,
    fields,
    settings,
  } = useNetworkSettings();

  const isObjectEmpty = objectName => Object.keys(objectName).length === 0;
  const handleColorChange = (value) => fields.colors.setter(value);
  const handleIconChange = (value) => fields.logo.setter(value, "icon");
  const handleFullChange = (value) => fields.logo.setter(value, "full");

  return(
    <NetworkLogoAndColorsSettingsView
      baseUrl={urlWithoutProtocol(publicRuntimeConfig?.urls?.api)}
      network={network}
      queryableNetworkName={network?.name ? getQueryableText(network?.name) : null}
      iconLogoField={details?.iconLogo}
      fullLogoField={details?.fullLogo}
      isLogosSizeTooLarge={errorBigImages}
      networkTheme={settings?.theme}
      isEmptyTheme={isObjectEmpty(settings?.theme?.colors)}
      onIconLogoChange={handleIconChange}
      onFullLogoChange={handleFullChange}
      onColorChange={handleColorChange}
    />
  );
}
