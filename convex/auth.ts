import GitHub from "@auth/core/providers/github";
import Google from "@auth/core/providers/google";
import { DataModel } from "./_generated/dataModel";
import { convexAuth } from "@convex-dev/auth/server";
import { Password } from "@convex-dev/auth/providers/Password";

/**
 * Custom Password Authentication Configuration
 * Extends the base Password provider with custom profile fields
 * 
 * @param params - Authentication parameters including email and name
 * @returns User profile object with default values
 */
const CustomPassword = Password<DataModel>({
  profile(params) {
    return {
      email: params.email as string,
      name: params.name as string,
      selectedTemplate: "",
      hasPurchasedPremium: false,
      hasPurchasedStarter: false,
    }
  }
})

/**
 * Authentication Configuration
 * Supports multiple authentication providers:
 * - GitHub OAuth
 * - Google OAuth
 * - Custom Password Authentication
 * 
 * For additional providers, see: https://labs.convex.dev/auth-example
 */
export const { auth, signIn, signOut, store } = convexAuth({
  providers: [GitHub, Google, CustomPassword],
});