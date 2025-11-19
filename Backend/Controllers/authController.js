// Predefined credentials
const users = [
  {
    email: "admin@example.com",
    password: "admin123",
    type: "admin",
    name: "Admin User",
  },
  {
    email: "user@example.com",
    password: "123456",
    type: "user",
    name: "Demo User",
  },
];

export const loginUser = (req, res) => {
  const { email, password } = req.body;

  // Find user with matching email and password
  const user = users.find((u) => u.email === email && u.password === password);

  if (user) {
    return res.json({
      success: true,
      token: "dummy-token-123",
      user: {
        email: user.email,
        name: user.name,
        type: user.type, // send type to frontend
      },
    });
  } else {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }
};
