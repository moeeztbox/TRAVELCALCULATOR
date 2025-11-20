// controllers/authController.js
import User from "../models/user.js";
import jwt from "jsonwebtoken";

/**
 * POST /api/auth/login
 * Body: { email, password }
 */
export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input quickly
    if (!email || !password) {
      return res.status(400).json({ success: false, message: "Email and password required" });
    }

    // Find user by email (MongoDB)
    const user = await User.findOne({ email });

    // If no user or password mismatch
    // NOTE: This compares plain text. Replace with bcrypt.compare() if you hash passwords.
    if (!user || user.password !== password) {
      return res.status(401).json({ success: false, message: "Invalid credentials" });
    }

    // Choose secret and expiry based on role
    const isAdmin = user.type === "admin";
    const secret = isAdmin ? process.env.JWT_SECRET_ADMIN : process.env.JWT_SECRET_USER;
    const expiresIn = isAdmin ? (process.env.JWT_EXPIRES_ADMIN || "7d") : (process.env.JWT_EXPIRES_USER || "1d");

    // Payload — include minimal data
    const payload = {
      id: user._id,
      email: user.email,
      type: user.type,
      name: user.name,
    };

    // Create token
    const token = jwt.sign(payload, secret, { expiresIn });

    // Return token and user info
    return res.json({
      success: true,
      token,
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
