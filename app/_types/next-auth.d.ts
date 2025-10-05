import { DefaultSession, DefaultUser } from "next-auth";
import { JWT as DefaultJWT } from "next-auth/jwt";

declare module "next-auth" {
  /**
   * This session object is what is returned by `useSession`, `getSession`, etc.
   * We are keeping it lean to improve performance and avoid cookie size limits.
   * It contains only essential, stable user data.
   * Components that need more detailed user data (e.g., rewardPoints, achievements) should fetch it from Firestore using the user's ID.
   */
  interface Session {
    user: {
      id: string;
      /** The authentication provider used for the session (e.g., 'github', 'firebase'). */
      provider?: string;
      createdAt: number;
    } & DefaultSession["user"]; // Keep existing properties like name, email, image
  }

  /**
   * The user object shape passed to callbacks.
   */
  interface User extends DefaultUser {
    // id is already part of DefaultUser
    // Extended properties for initial sign-in data transfer
    lastLoginAt: number;
    createdAt: number;
  }
}

declare module "next-auth/jwt" {
  /**
   * This is the shape of the JWT token.
   * We keep it lean, containing only the primary identifiers for the user.
   * The full user profile is not stored in the JWT to keep it small and fast.
   */
  interface JWT extends DefaultJWT {
    /** The user's unique identifier (e.g., Firebase UID or provider-specific ID). */
    uid: string;
    /** The authentication provider (e.g., 'github', 'firebase'). */
    provider?: string;
    // name, email, picture are included by default from NextAuth
    createdAt: number;
  }
}
