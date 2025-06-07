import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * Returned by `useSession`, `getSession` and received as a prop on the `SessionProvider` React Context
   */
  interface Session {
    user: {
      /** The user's Firebase UID. */
      id: string;
      provider?: string;
      rewardPoints: number;
      notifyReminders: boolean;
      notifyAchievements: boolean;
    } & DefaultSession["user"]; // Keep existing properties like name, email, image
  }

  /**
   * The shape of the user object returned in the OAuth providers' `profile` callback,
   * or the second parameter of the `session` callback, when using a database.
   * Also the shape of the user object returned by the `authorize` callback of the Credentials provider.
   */
  interface User extends DefaultUser {
    // id is already part of DefaultUser
    provider: string;
    rewardPoints: number;
    notifyReminders: boolean;
    notifyAchievements: boolean;
  }
}

declare module "next-auth/jwt" {
  /** Returned by the `jwt` callback and `getToken`, when using JWT sessions */
  interface JWT extends DefaultJWT {
    /** Firebase UID */
    uid: string;
    provider?: string;
    rewardPoints: number;
    notifyReminders: boolean;
    notifyAchievements: boolean;
    // name, email, picture are often included by default if available from provider
  }
}
