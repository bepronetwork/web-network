import { UserRole } from "interfaces/enums/roles";

import { JwtToken } from "server/auth/types";

export class UserRoleUtils {
  static getGovernorRole(chainId: string | number, networkAddress: string) {
    return `${UserRole.GOVERNOR}:${chainId}_${networkAddress}`;
  }

  static hasAdminRole(token: JwtToken) {
    return !!token?.roles?.includes("admin");
  }

  static hasGovernorRole(token: JwtToken) {
    return !!token?.roles?.find(role => role?.includes("governor"));
  }

  static isGovernorOf(token: JwtToken, chainId: string, networkAddress: string) {
    return !!token?.roles?.includes(this.getGovernorRole(chainId, networkAddress));
  }
}