// utils/loginLockout.js
//
// Progressive account-lockout math shared by the login controller.
// Kept isolated from authController.js so the escalation ladder and its
// reasoning are easy to find/tune in one place.

// Lockout duration by escalation level (1-indexed: the 1st lockout imposed
// on an account is level 1, the 2nd is level 2, etc). Level 6 and beyond
// all use the same duration — 8 hours is the recommended ceiling. Doubling
// indefinitely (16h, 32h, ...) would let a sustained low-and-slow attacker
// turn an account-lockout defense into a de-facto permanent denial-of-
// service against the legitimate owner, which is worse than the brute-force
// risk it's meant to prevent. 8 hours is long enough to make brute-forcing
// impractical while guaranteeing the real owner can always get back in
// within, at most, a single working day.
const LOCK_DURATIONS_MS = [
  15 * 60 * 1000, // level 1: 15 minutes
  30 * 60 * 1000, // level 2: 30 minutes
  60 * 60 * 1000, // level 3: 1 hour
  2 * 60 * 60 * 1000, // level 4: 2 hours
  4 * 60 * 60 * 1000, // level 5: 4 hours
  8 * 60 * 60 * 1000, // level 6+: 8 hours (cap)
];

export const FAILED_ATTEMPTS_THRESHOLD = 5;

// A successful login always clears the immediate failed-attempt counter,
// but the escalation *level* only decays after this much sustained good
// standing since the last lock — otherwise an attacker interleaved with
// occasional real logins could keep cheaply resetting the ladder back to
// the 15-minute lock instead of it ever reaching the longer durations.
export const LOCK_LEVEL_DECAY_MS = 24 * 60 * 60 * 1000; // 24 hours

// nextLockLevel is 1-indexed (the lockout about to be imposed).
export const getLockDurationMs = (nextLockLevel) => {
  const index = Math.min(Math.max(nextLockLevel, 1), LOCK_DURATIONS_MS.length) - 1;
  return LOCK_DURATIONS_MS[index];
};

// Human-friendly "X minutes" / "X hours Y minutes", always rounded UP to
// the nearest minute so it never under-promises (never says a lock is
// already over while a few seconds of it remain).
export const formatRemaining = (ms) => {
  const totalMinutes = Math.max(1, Math.ceil(ms / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  if (hours === 0) return `${minutes} minute${minutes === 1 ? "" : "s"}`;
  if (minutes === 0) return `${hours} hour${hours === 1 ? "" : "s"}`;
  return `${hours} hour${hours === 1 ? "" : "s"} ${minutes} minute${minutes === 1 ? "" : "s"}`;
};
