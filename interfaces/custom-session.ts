import { ISODateString } from "next-auth";

export interface CustomSession extends Record<string, unknown> {
  user?: {
    name?: string | null;
    email?: string | null;
    image?: string | null;
    login?: string | null;
  };
  expires: ISODateString;
}
