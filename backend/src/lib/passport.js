import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import User from "../model/User.js";
import dotenv from 'dotenv';

dotenv.config();

const callbackBase = process.env.SERVER_URL + "/api/auth";
console.log(callbackBase);

// In passport.js, update the Google strategy:
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `http://localhost:3000/api/auth/google/callback`,
      // Add these options
      passReqToCallback: true,
      proxy: true // If you're behind a proxy/load balancer
    },
      async (req, accessToken, refreshToken, profile, done) => {
      try {
        console.log('Google profile received:', {
          id: profile.id,
          email: profile.emails?.[0]?.value,
          name: profile.displayName
        });

        const email = profile.emails?.[0]?.value;
        if (!email) {
          console.error('No email in Google profile');
          return done(new Error("No email found in Google profile"), null);
        }

        let user = await User.findOne({ email });
        console.log('Found user in DB:', user ? user.email : 'No user found');

        if (!user) {
          console.log('Creating new user with email:', email);
          user = await User.create({
            name: profile.displayName,
            email,
            provider: "google",
            providerId: profile.id,
            avatar: profile.photos?.[0]?.value,
          });
          console.log('New user created:', user.email);
        }

        return done(null, user);
      } catch (err) {
        console.error('Error in Google strategy:', err);
        return done(err, null);
      }
    }
  )
);

passport.use(
  'github',
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `http://localhost:3000/api/auth/github/callback`,
      scope: ['user:email'],
      passReqToCallback: true,
      proxy: true // Add this if you're behind a proxy
    },
    async (req, accessToken, refreshToken, profile, done) => {
      try {
        let email = profile.emails?.[0]?.value;

        if (!email) {
          try {
            const response = await fetch("https://api.github.com/user/emails", {
              headers: {
                Authorization: `token ${accessToken}`,
                "User-Agent": "backend",
                Accept: "application/vnd.github.v3+json"
              },
            });

            if (!response.ok) {
              throw new Error(`GitHub API error: ${response.statusText}`);
            }

            const emails = await response.json();
            if (!emails || !Array.isArray(emails) || emails.length === 0) {
              throw new Error('No email addresses found for GitHub account');
            }

            email = emails.find(e => e.primary)?.email || emails[0].email;
            
            if (!email) {
              return done(new Error("GitHub email is required but not found"), null);
            }
          } catch (error) {
            console.error('Error fetching GitHub emails:', error);
            return done(new Error('Failed to fetch email from GitHub'), null);
          }
        }

        let user = await User.findOne({ email });
        if (!user) {
          user = await User.create({
            name: profile.displayName || profile.username,
            email,
            provider: "github",
            providerId: profile.id,
            avatar: profile.photos?.[0]?.value,
          });
        }

        return done(null, user);
      } catch (err) {
        console.error("GitHub Strategy Error:", err.message);
        return done(err, null);
      }
    }
  )
);

// Serialize user into the sessions
// passport.serializeUser((user, done) => {
//   try {
//     done(null, user.id);
//   } catch (error) {
//     done(error, null);
//   }
// });

// // Deserialize user from the sessions
// passport.deserializeUser(async (id, done) => {
//   try {
//     const user = await User.findById(id);
//     if (!user) {
//       return done(new Error('User not found'), null);
//     }
//     done(null, user);
//   } catch (error) {
//     done(error, null);
//   }
// });

export default passport;