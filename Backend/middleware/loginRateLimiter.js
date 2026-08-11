// middleware/loginRateLimiter.js
import rateLimit from "express-rate-limit";

// IP-based limiter for POST /api/auth/login — a second, complementary layer
// to the per-account progressive lockout in authController.js:
//
//   - Account lockout stops someone hammering ONE account's password.
//   - This stops someone hammering MANY accounts (including nonexistent
//     emails, which have no account document to lock) from ONE source, and
//     also incidentally closes a subtle enumeration gap: without it, an
//     attacker could distinguish real vs. fake emails purely by noticing
//     that only real accounts ever start returning the 429 "locked"
//     response after 5 attempts. Capping total attempts per IP makes that
//     kind of probing impractical regardless of which emails are real.
//
// `skipSuccessfulRequests` means only failed/attempted requests (4xx/5xx)
// count against the budget — a shared office/NAT IP with many people
// successfully logging in is never penalized, only a burst of failures is.
export const loginRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // generous enough for shared-IP legitimate traffic, still caps abuse
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: true,
  handler: (req, res) => {
    res.status(429).json({
      success: false,
      message: "Too many login attempts from this network. Please try again later.",
    });
  },
});
