import { CallbacksOptions } from "next-auth";
import { Provider } from "next-auth/providers";

export * from "server/auth/providers/ethereum-provider";
export * from "server/auth/providers/github-provider";

export interface AuthProvider {
  config: Provider;
  callbacks: {
    signIn: CallbacksOptions["signIn"];
    jwt: CallbacksOptions["jwt"];
  };
}