import { toLower } from "helpers/string";

export function isMethodAllowed(method: string, allowedMethods: string[]) {
  return !!allowedMethods.find(allowed => toLower(allowed) === toLower(method));
}