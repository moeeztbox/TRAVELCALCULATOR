// Predefined credentials
const fixedUser = {
  email: "user@example.com", // fixed email
  password: "123456", // fixed password
};

export const loginUser = (req, res) => {
  const { email, password } = req.body;

  if (email === fixedUser.email && password === fixedUser.password) {
    // On success, send back a dummy token
    return res.json({
      success: true,
      token: "dummy-token-123",
      user: {
        email: fixedUser.email,
        name: "Demo User",
      },
    });
  } else {
    return res
      .status(401)
      .json({ success: false, message: "Invalid credentials" });
  }
};
