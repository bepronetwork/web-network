import { ISODateString } from "next-auth";

import { MatchAccountsStatus } from "interfaces/enums/api";

export interface CustomSession extends Record<string, unknown> {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    login?: string | null;
    accessToken?: string | null;
    address?: string | null;
    roles?: string[] | null;
    accountsMatch?: MatchAccountsStatus | null;
    isEmailConfirmed?: boolean | null;
    emailVerificationSentAt?: string | null;
  };
  expires: ISODateString;
}
