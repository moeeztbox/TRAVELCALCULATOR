// controllers/authController.js
import User from "../models/user.js";
import jwt from "jsonwebtoken";
import {
  FAILED_ATTEMPTS_THRESHOLD,
  LOCK_LEVEL_DECAY_MS,
  getLockDurationMs,
  formatRemaining,
} from "../utils/loginLockout.js";

const isProd = process.env.NODE_ENV === "production";

// No maxAge/expires is set here on purpose — this makes the auth cookie a
// browser "session cookie", which the browser (or Electron's underlying
// Chromium session) discards when it is fully closed. Combined with the
// JWT's own expiresIn below, this gives two layers of expiry: the cookie
// dies with the browser session, and the token itself has a hard expiry
// even if the cookie somehow persisted.
const cookieOptions = () => ({
  httpOnly: true, // not readable from JS — protects against XSS token theft
  secure: isProd, // HTTPS only in production
  sameSite: "lax",
  path: "/",
});

/**
 * POST /api/auth/login
 * Body: { email, password }
 * On success, sets an httpOnly session cookie so the frontend never has to
 * hold the token itself (no localStorage/sessionStorage involved).
 *
 * Also enforces progressive account lockout (applies equally to admin and
 * user accounts — they share this one endpoint and one User model):
 * after FAILED_ATTEMPTS_THRESHOLD consecutive invalid attempts, the account
 * is locked for an escalating duration (15m/30m/1h/2h/4h/8h, capped at 8h).
 * See utils/loginLockout.js for the duration ladder and decay rule, and
 * README-style comments below for the concurrency-safety reasoning.
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    const user = await User.findOne({ email });

    // Unknown email: respond exactly like a wrong password (same status,
    // same generic message) so the response never reveals whether an
    // account exists. There's no account document to track/lock here —
    // the IP-based rate limiter on this route (see Routes/auth.js) is what
    // covers repeated guessing across many/nonexistent emails from one source.
    if (!user) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Already locked: reject before ever touching the password (so a flood
    // of requests during the lock window can't consume bcrypt CPU cycles,
    // and — critically — can't increment the counter or extend/shorten the
    // lock). This is a pure read, so no race condition is possible here:
    // whichever request reads a still-in-the-future lockUntil just rejects.
    if (user.lockUntil && user.lockUntil > new Date()) {
      const remainingMs = user.lockUntil.getTime() - Date.now();
      return res.status(429).json({
        success: false,
        locked: true,
        message: `Too many failed login attempts. Please try again in ${formatRemaining(remainingMs)}.`,
      });
    }

    const passwordValid = await user.comparePassword(password);

    if (!passwordValid) {
      // Atomically increment — MongoDB's $inc is race-safe under concurrent
      // requests (no lost updates), unlike a read-modify-write via .save().
      const afterFail = await User.findOneAndUpdate(
        { _id: user._id },
        { $inc: { failedLoginAttempts: 1 } },
        { new: true }
      );

      if (afterFail.failedLoginAttempts >= FAILED_ATTEMPTS_THRESHOLD) {
        const nextLevel = (afterFail.lockLevel || 0) + 1;
        const durationMs = getLockDurationMs(nextLevel);
        const lockUntil = new Date(Date.now() + durationMs);

        // Conditional atomic update: only matches (and only takes effect)
        // if failedLoginAttempts is still >= threshold at the moment this
        // specific update runs. If several requests cross the threshold
        // concurrently, the first one to execute resets the counter to 0
        // as part of the same atomic operation, so every subsequent
        // concurrent request's identical filter no longer matches — the
        // lock is imposed exactly once, never double-escalated. All of
        // them computed the same nextLevel/durationMs beforehand (nothing
        // else could have changed lockLevel yet), so it's safe for every
        // concurrent request to report the same lockout message below
        // regardless of which one's write actually "won".
        await User.findOneAndUpdate(
          { _id: user._id, failedLoginAttempts: { $gte: FAILED_ATTEMPTS_THRESHOLD } },
          {
            $set: {
              lockUntil,
              lockLevel: nextLevel,
              lastLockAt: new Date(),
              failedLoginAttempts: 0,
            },
          }
        );

        return res.status(429).json({
          success: false,
          locked: true,
          message: `Too many failed login attempts. Please try again in ${formatRemaining(durationMs)}.`,
        });
      }

      // Below the threshold: identical generic message either way — never
      // reveal the remaining-attempts count or how close to a lock this is.
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Successful login: always clear the immediate failed-attempt streak.
    // The escalation *level* itself only decays after a sustained period
    // (LOCK_LEVEL_DECAY_MS) with no new lock — see the model comment and
    // utils/loginLockout.js for why this isn't reset unconditionally.
    const shouldDecayLockLevel =
      user.lockLevel > 0 &&
      user.lastLockAt &&
      Date.now() - user.lastLockAt.getTime() >= LOCK_LEVEL_DECAY_MS;

    await User.updateOne(
      { _id: user._id },
      {
        $set: {
          failedLoginAttempts: 0,
          ...(shouldDecayLockLevel ? { lockLevel: 0 } : {}),
        },
      }
    );

    const isAdmin = user.type === "admin";
    const secret = isAdmin ? process.env.JWT_SECRET_ADMIN : process.env.JWT_SECRET_USER;
    const expiresIn = isAdmin ? (process.env.JWT_EXPIRES_ADMIN || "7d") : (process.env.JWT_EXPIRES_USER || "1d");

    const payload = {
      id: user._id,
      email: user.email,
      type: user.type,
      name: user.name,
    };

    const token = jwt.sign(payload, secret, { expiresIn });

    res.cookie("token", token, cookieOptions());

    return res.json({
      success: true,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        type: user.type,
      },
    });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
};

/**
 * GET /api/auth/me
 * Returns the currently logged-in user (from the session cookie), if any.
 * Used by the frontend on page load to restore auth state without
 * storing anything in localStorage.
 */
export const getMe = async (req, res) => {
  if (!req.user) {
    return res.status(200).json({ success: true, user: null });
  }

  return res.status(200).json({
    success: true,
    user: {
      id: req.user.id,
      email: req.user.email,
      name: req.user.name,
      type: req.user.type,
    },
  });
};

/**
 * POST /api/auth/logout
 * Clears the session cookie.
 */
export const logoutUser = (req, res) => {
  res.clearCookie("token", cookieOptions());
  return res.json({ success: true, message: "Logged out" });
};
