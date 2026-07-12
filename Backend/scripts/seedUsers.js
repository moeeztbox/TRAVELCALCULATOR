// scripts/seedUsers.js
// Usage: node scripts/seedUsers.js
import dotenv from "dotenv";
dotenv.config();

import connectDB from "../config/db.js";
import User from "../Models/user.js";
import mongoose from "mongoose";

const accounts = [
  { email: "admin@gmail.com", password: "admin123", type: "admin", name: "Admin" },
  { email: "moeez@gmail.com", password: "moeez123", type: "user", name: "Moeez" },
];

const run = async () => {
  await connectDB();

  for (const account of accounts) {
    const existing = await User.findOne({ email: account.email });

    if (existing) {
      existing.password = account.password; // re-hashed by the pre-save hook
      existing.type = account.type;
      existing.name = account.name;
      await existing.save();
      console.log(`Updated: ${account.email} (${account.type})`);
    } else {
      await User.create(account);
      console.log(`Created: ${account.email} (${account.type})`);
    }
  }

  await mongoose.disconnect();
  console.log("Done.");
};

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
