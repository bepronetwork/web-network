export interface JwtToken {
  nonce?: string;
  roles?: string[];
  address?: string;
  signature?: string;
  issuedAt?: string;
  expiresAt?: string;
  name?: string;
  login?: string;
  provider?: string;
  accessToken?: string;
}