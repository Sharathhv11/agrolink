const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const User = require('../models/User');
const dotenv = require('dotenv');

dotenv.config();

passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID || 'dummy_client_id_for_init',
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'dummy_secret_for_init',
      callbackURL: process.env.GOOGLE_CALLBACK_URL || '/api/auth/google/callback',
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ googleId: profile.id });

        if (user) {
          return done(null, user);
        }

        if (profile.emails && profile.emails.length > 0) {
            user = await User.findOne({ email: profile.emails[0].value });
            if (user) {
                user.googleId = profile.id;
                user.avatar = user.avatar || (profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null);
                await user.save();
                return done(null, user);
            }
        }

        user = await User.create({
          googleId: profile.id,
          name: profile.displayName,
          email: profile.emails && profile.emails.length > 0 ? profile.emails[0].value : null,
          avatar: profile.photos && profile.photos.length > 0 ? profile.photos[0].value : null,
        });

        done(null, user);
      } catch (error) {
        console.error(error);
        done(error, null);
      }
    }
  )
);

module.exports = passport;
