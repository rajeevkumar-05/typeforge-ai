
import passport from 'passport';
import { Strategy as GoogleStrategy } from 'passport-google-oauth20';
import User from '../models/User';

const setupPassport = (): void => {
  // Google OAuth Strategy
  if (process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET) {
    passport.use(
      new GoogleStrategy(
        {
          clientID: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
          callbackURL:
            process.env.GOOGLE_CALLBACK_URL ||
            'http://localhost:5000/api/auth/google/callback',
        },
        async (_accessToken, _refreshToken, profile, done) => {
          try {
            let user = await User.findOne({
              provider: 'google',
              providerId: profile.id,
            });

            if (!user) {
              // Check if email already exists with a different provider
              const existingUser = await User.findOne({
                email: profile.emails?.[0]?.value,
              });

              if (existingUser) {
                existingUser.provider = 'google';
                existingUser.providerId = profile.id;
                existingUser.avatar =
                  profile.photos?.[0]?.value || existingUser.avatar;

                await existingUser.save();
                return done(null, existingUser);
              }

              user = await User.create({
                username:
                  profile.displayName?.replace(/\s+/g, '_').toLowerCase() ||
                  `user_${Date.now()}`,
                email: profile.emails?.[0]?.value,
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

    console.log('✅ Google OAuth strategy configured');
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
