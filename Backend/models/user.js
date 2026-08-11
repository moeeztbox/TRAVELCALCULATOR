// models/user.js
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    password: {
      type: String,
      required: true,
    },
    type: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // --- Brute-force / progressive lockout tracking ---
    // Consecutive invalid-credential attempts since the last successful
    // login or the last time a lock was imposed. Reset to 0 on either.
    failedLoginAttempts: {
      type: Number,
      default: 0,
    },
    // Set when a lockout is imposed; login is rejected while this is in
    // the future. Cleared implicitly once it's in the past (no separate
    // "isLocked" boolean to keep out of sync with reality).
    lockUntil: {
      type: Date,
      default: null,
    },
    // How many times a lockout has been imposed in the current escalation
    // streak — drives the 15m/30m/1h/2h/4h/8h progression. Only decays
    // back to 0 after a sustained period of successful logins with no new
    // lockout (see authController.js) — not on every single successful
    // login, so a persistent attacker interleaved with real logins can't
    // keep resetting the ladder back to the cheapest 15-minute lock.
    lockLevel: {
      type: Number,
      default: 0,
    },
    // Timestamp of the most recently imposed lock — used to decide when
    // lockLevel has "cooled down" enough to decay.
    lastLockAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model("User", userSchema);

export default User;
