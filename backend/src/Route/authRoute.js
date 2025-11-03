import express from 'express';
import { getProfile, login, logOut, refreshToken, register } from '../controller/authController.js';
import { generateToken, setCookies } from '../lib/Token&Cookies.js';
import { protectRoute } from '../middleware/authMiddleware.js';
import passport from '../lib/passport.js';

const router = express.Router();

router.post('/register', register);
router.post('/login', login);
router.post('/logout', logOut);
router.post('/refresh-token', refreshToken);
router.get('/profile', protectRoute, getProfile);


// Google login
router.get("/google", (req, res, next) => {
  console.log('Initiating Google OAuth...');
  passport.authenticate("google", { 
    scope: ["profile", "email"],
    accessType: 'offline',
    prompt: 'select_account consent',  // Force account selection and consent
    session: false,
    includeGrantedScopes: false  // Don't use previously granted scopes
  })(req, res, next);
});

router.get(
  "/google/callback",
  (req, res, next) => {
    console.log('Google OAuth callback received');
    passport.authenticate("google", { 
      session: false, 
      failureRedirect: `${process.env.CLIENT_URL}/login?error=google` 
    }, (err, user, info) => {
      if (err) {
        console.error('Google Auth Error:', err);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
      }
      if (!user) {
        console.error('No user returned from Google:', info);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=no_user`);
      }
      
      try {
        const { accessToken, refreshToken } = generateToken(user._id);
        setCookies(res, accessToken, refreshToken);
        res.redirect(`${process.env.CLIENT_URL}/dashboard`);
      } catch (error) {
        console.error('Error in Google callback:', error);
        res.redirect(`${process.env.CLIENT_URL}/login?error=token_error`);
      }
    })(req, res, next);
  }
);

// GitHub login
router.get("/github", (req, res, next) => {
  console.log('Initiating GitHub OAuth...');
  passport.authenticate('github', { 
    scope: ['user:email'],
    session: false,
    failureRedirect: `${process.env.CLIENT_URL}/login?error=github`,
    failureMessage: true
  })(req, res, next);
});

router.get(
  "/github/callback",
  (req, res, next) => {
    console.log('GitHub OAuth callback received');
    passport.authenticate('github', { 
      session: false,
      failureRedirect: `${process.env.CLIENT_URL}/login?error=github`,
      failureMessage: true
    }, (err, user, info) => {
      if (err) {
        console.error('GitHub Auth Error:', err);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=auth_failed`);
      }
      if (!user) {
        console.error('No user returned from GitHub:', info);
        return res.redirect(`${process.env.CLIENT_URL}/login?error=no_user`);
      }
      
      try {
        const { accessToken, refreshToken } = generateToken(user._id);
        setCookies(res, accessToken, refreshToken);
        res.redirect(`${process.env.CLIENT_URL}/dashboard`);
      } catch (error) {
        console.error('Error in GitHub callback:', error);
        res.redirect(`${process.env.CLIENT_URL}/login?error=token_error`);
      }
    })(req, res, next);
  }
);


export default router;