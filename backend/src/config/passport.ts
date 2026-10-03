import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';

const generateUniqueUsername = async (
  displayName?: string,
  email?: string
): Promise<string> => {
  let base = (displayName || (email ? email.split('@')[0] : 'user'))
    .toLowerCase()
    .replace(/[^a-z0-9_]/g, '_')
    .replace(/^_+|_+$/g, '');

  if (base.length < 3) {
    base = `user_${base}`.slice(0, 20);
  }
  if (base.length > 20) {
    base = base.slice(0, 20);
  }

  let candidate = base;
  let counter = 1;
  while (await User.exists({ username: candidate })) {
    const suffix = `_${Math.floor(1000 + Math.random() * 9000)}`;
    candidate = `${base.slice(0, 30 - suffix.length)}${suffix}`;
    counter++;
    if (counter > 10) {
      candidate = `user_${Date.now()}`.slice(0, 30);
      break;
    }
  }

  return candidate;
};

const setupPassport = (): void => {
  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    const callbackURL =
      process.env.GOOGLE_CALLBACK_URL ||
      (process.env.NODE_ENV === 'production'
        ? 'https://typeforge-backend.onrender.com/api/auth/google/callback'
        : 'http://localhost:5000/api/auth/google/callback');

    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL,
          proxy: true,
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            const email = profile.emails?.[0]?.value;
            if (!email) {
              return done(new Error('No email found in Google profile'), undefined);
            }

            let user = await User.findOne({
              provider: 'google',
              providerId: profile.id,
            });

            if (!user) {
              // Check if email already exists with a different provider
              const existingUser = await User.findOne({
                email,
              });

              if (existingUser) {
                existingUser.provider = 'google';
                existingUser.providerId = profile.id;
                existingUser.avatar =
                  profile.photos?.[0]?.value || existingUser.avatar;

                await existingUser.save();
                return done(null, existingUser);
              }

              const username = await generateUniqueUsername(profile.displayName, email);

              user = await User.create({
                username,
                email,
                provider: 'google',
                providerId: profile.id,
                avatar: profile.photos?.[0]?.value || '',
              });
            }

            done(null, user);
          } catch (error) {
            console.error('[Passport] Google OAuth error:', error);
            done(error as Error, undefined);
          }
        }
      )
    );

    console.log(`✅ Google OAuth strategy configured with callback: ${callbackURL}`);
  } else {
    console.warn(
      '⚠️ Google OAuth not configured (missing GOOGLE_CLIENT_ID or GOOGLE_CLIENT_SECRET)'
    );
  }

  passport.serializeUser((user: any, done) => {
    done(null, user._id);
  });

  passport.deserializeUser(async (id: string, done) => {
    try {
      const user = await User.findById(id);
      done(null, user);
    } catch (error) {
      done(error, null);
    }
  });
};

export default setupPassport;
