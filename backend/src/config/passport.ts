import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import type { Profile, VerifyCallback } from "passport-google-oauth20";
import { db } from "../db/index.js";
import { users } from "../db/schema.js";
import { eq } from "drizzle-orm";

// Initialize passport configuration
export const initializePassport = () => {
  const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID;
  const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET;
  const GOOGLE_CALLBACK_URL = process.env.GOOGLE_CALLBACK_URL || "http://localhost:5000/api/google-auth/google/callback";

  // Configure Google OAuth Strategy only if credentials are provided
  if (GOOGLE_CLIENT_ID && GOOGLE_CLIENT_SECRET) {
    passport.use(
    new GoogleStrategy(
      {
        clientID: GOOGLE_CLIENT_ID,
        clientSecret: GOOGLE_CLIENT_SECRET,
        callbackURL: GOOGLE_CALLBACK_URL,
        scope: ["profile", "email"],
      },
    async (accessToken: string, refreshToken: string, profile: Profile, done: VerifyCallback) => {
      try {
        // Check if user already exists with this Google ID
        const [existingUser] = await db
          .select()
          .from(users)
          .where(eq(users.googleId, profile.id))
          .limit(1);

        if (existingUser) {
          return done(null, existingUser);
        }

        // Check if user exists with this email
        const email = profile.emails?.[0]?.value;
        if (email) {
          const [emailUser] = await db
            .select()
            .from(users)
            .where(eq(users.gmail, email))
            .limit(1);

          if (emailUser) {
            // Update existing user with Google ID
            const [updatedUser] = await db
              .update(users)
              .set({
                googleId: profile.id,
                profilePicture: profile.photos?.[0]?.value,
              })
              .where(eq(users.id, emailUser.id))
              .returning();

            return done(null, updatedUser);
          }
        }

        // Create new user
        const [newUser] = await db
          .insert(users)
          .values({
            login: profile.displayName || profile.emails?.[0]?.value?.split("@")[0] || "user",
            gmail: email || `${profile.id}@google.com`,
            googleId: profile.id,
            profilePicture: profile.photos?.[0]?.value,
            password: null, // Google users don't have a password
          })
          .returning();

        return done(null, newUser);
      } catch (error) {
        return done(error as Error, undefined);
      }
    }
    )
  );
  } else {
    console.warn('⚠️  Google OAuth not configured. Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in .env file.');
  }

  // Serialize user for session
  passport.serializeUser((user: any, done) => {
    done(null, user.id);
  });

  // Deserialize user from session
  passport.deserializeUser(async (id: number, done) => {
    try {
      const [user] = await db
        .select()
        .from(users)
        .where(eq(users.id, id))
        .limit(1);

      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });

  return passport;
};

export default passport;

