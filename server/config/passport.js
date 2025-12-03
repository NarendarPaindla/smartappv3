const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const GitHubStrategy = require('passport-github2').Strategy;
const LinkedInStrategy = require('passport-linkedin-oauth2').Strategy;
const User = require('../models/User');

passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const user = await User.findById(id);
        done(null, user);
    } catch (err) {
        done(err, null);
    }
});

// Google Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID || 'placeholder_id',
    clientSecret: process.env.GOOGLE_CLIENT_SECRET || 'placeholder_secret',
    callbackURL: "/api/auth/google/callback"
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ googleId: profile.id });
        if (user) return done(null, user);

        user = await User.findOne({ email: profile.emails[0].value });
        if (user) {
            user.googleId = profile.id;
            await user.save();
            return done(null, user);
        }

        const newUser = await User.create({
            name: profile.displayName,
            email: profile.emails[0].value,
            password: 'social_login_placeholder', // Placeholder, user should set one later if they want
            googleId: profile.id
        });
        done(null, newUser);
    } catch (err) {
        done(err, null);
    }
}));

// GitHub Strategy
passport.use(new GitHubStrategy({
    clientID: process.env.GITHUB_CLIENT_ID || 'placeholder_id',
    clientSecret: process.env.GITHUB_CLIENT_SECRET || 'placeholder_secret',
    callbackURL: "/api/auth/github/callback",
    scope: ['user:email']
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ githubId: profile.id });
        if (user) return done(null, user);

        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (email) {
            user = await User.findOne({ email });
            if (user) {
                user.githubId = profile.id;
                await user.save();
                return done(null, user);
            }
        }

        const newUser = await User.create({
            name: profile.displayName || profile.username,
            email: email || `${profile.username}@github.placeholder.com`,
            password: 'social_login_placeholder',
            githubId: profile.id
        });
        done(null, newUser);
    } catch (err) {
        done(err, null);
    }
}));

// LinkedIn Strategy
passport.use(new LinkedInStrategy({
    clientID: process.env.LINKEDIN_CLIENT_ID || 'placeholder_id',
    clientSecret: process.env.LINKEDIN_CLIENT_SECRET || 'placeholder_secret',
    callbackURL: "/api/auth/linkedin/callback",
    scope: ['r_emailaddress', 'r_liteprofile'],
}, async (accessToken, refreshToken, profile, done) => {
    try {
        let user = await User.findOne({ linkedinId: profile.id });
        if (user) return done(null, user);

        const email = profile.emails && profile.emails[0] ? profile.emails[0].value : null;
        if (email) {
            user = await User.findOne({ email });
            if (user) {
                user.linkedinId = profile.id;
                await user.save();
                return done(null, user);
            }
        }

        const newUser = await User.create({
            name: profile.displayName,
            email: email || `${profile.id}@linkedin.placeholder.com`,
            password: 'social_login_placeholder',
            linkedinId: profile.id
        });
        done(null, newUser);
    } catch (err) {
        done(err, null);
    }
}));

module.exports = passport;
