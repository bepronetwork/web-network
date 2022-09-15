import readTokenChanged from "helpers/api/registry/read-changed";
import readNetworkRegistered from "helpers/api/registry/read-registered";

export const RegistryHelpers = {
  "changed": ["getChangeAllowedTokensEvents", readTokenChanged],
  "registered": ["getNetworkRegisteredEvents", readNetworkRegistered],
};