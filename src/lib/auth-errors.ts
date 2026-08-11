import { CredentialsSignin } from "next-auth";

export class RateLimitSignInError extends CredentialsSignin {
  code = "rate_limit";
}
