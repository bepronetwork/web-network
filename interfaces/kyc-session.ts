export type Service = "individual" | "corporate";
export type Type =  "KYC" | "AML"
export type State =  "PENDING" | "VERIFIED" | "CANCELLED"

export interface kycSession{
  user_id: number,
  session_id: string,
  tier: number
  state: State
}
