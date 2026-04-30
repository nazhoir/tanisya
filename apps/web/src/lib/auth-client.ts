import { env } from "@tanisya/env/web";
import { createAuthClient } from "better-auth/react";
import { adminClient, usernameClient, organizationClient, emailOTPClient } from "better-auth/client/plugins";

export const authClient = createAuthClient({
  baseURL: env.NEXT_PUBLIC_SERVER_URL,
  plugins:[
    usernameClient(), adminClient(), organizationClient(), emailOTPClient() 
  ]
});
