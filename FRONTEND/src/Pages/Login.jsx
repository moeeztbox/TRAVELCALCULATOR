import { useLocation, useNavigate } from "react-router-dom";
import { useState } from "react";
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  Users,
  Shield,
  ArrowLeft,
} from "lucide-react";
import axios from "axios";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const type = location.state?.type || "user"; // default is user

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [focused, setFocused] = useState({});
  const [loading, setLoading] = useState(false);

  const isAdmin = type === "admin";
  const title = isAdmin ? "Welcome Back, Admin 👋" : "Welcome Back, User 👋";
  const subtitle = isAdmin
    ? "Sign in to your admin account"
    : "Sign in to your user account";

  const Icon = isAdmin ? Shield : Users;
  const themeColor = isAdmin ? "yellow" : "blue";

  const handleFocus = (field) => setFocused({ ...focused, [field]: true });
  const handleBlur = (field) => setFocused({ ...focused, [field]: false });

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:5000/api/login", {
        email,
        password,
        type, // send type to backend (optional)
      });

      if (res.data.success) {
        // ✅ Save all info to localStorage
        localStorage.setItem("isLoggedIn", "true");
        localStorage.setItem("token", res.data.token);
        localStorage.setItem("email", email); // from backend
        localStorage.setItem("type", type); // "admin" or "user"

        navigate("/dashboard");
      } else {
        alert(res.data.message || "Login failed");
      }
    } catch (err) {
      alert(err.response?.data?.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col justify-center items-center min-h-fit px-4 sm:px-6 lg:px-8">
      <div
        className={`bg-white rounded-2xl shadow-xl w-full max-w-md flex flex-col items-center p-6 sm:p-8 md:p-10 max-h-full overflow-hidden relative`}
      >
        {/* Back button */}
        <button
          onClick={() => navigate("/")}
          className="absolute cursor-pointer top-4 left-4 flex items-center gap-1 text-gray-500 hover:text-gray-700 transition"
        >
          <ArrowLeft size={20} /> Back
        </button>

        {/* Header */}
        <div className="flex flex-col items-center mb-6 sm:mb-8">
          <div className={`p-4 sm:p-5 bg-${themeColor}-50 rounded-full mb-4`}>
            <Icon
              className={`w-12 h-12 sm:w-14 sm:h-14 text-${themeColor}-600`}
            />
          </div>

          <h2 className="text-center text-2xl sm:text-3xl font-bold text-gray-800 mb-1">
            {title}
          </h2>

          <p className="text-center text-gray-500 text-sm sm:text-base">
            {subtitle}
          </p>
        </div>

        {/* Login Form */}
        <form onSubmit={handleLogin} className="w-full space-y-6 sm:space-y-8">
          <div>
            <label
              className={`flex items-center gap-2 text-gray-700 font-semibold mb-2 text-sm sm:text-base`}
            >
              <Mail className={`w-4 h-4 text-${themeColor}-600`} /> Email
            </label>
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              onFocus={() => handleFocus("email")}
              onBlur={() => handleBlur("email")}
              className={`w-full rounded-lg border-2 ${
                focused.email ? `border-${themeColor}-600` : "border-gray-300"
              } px-3 sm:px-4 py-2.5 text-sm sm:text-base focus:outline-none transition-all duration-300`}
              required
            />
          </div>

          <div>
            <label className="flex items-center gap-2 text-gray-700 font-semibold mb-2 text-sm sm:text-base">
              <Lock className={`w-4 h-4 text-${themeColor}-600`} /> Password
            </label>
            <div
              className={`flex items-center rounded-lg border-2 ${
                focused.password
                  ? `border-${themeColor}-600`
                  : "border-gray-300"
              } overflow-hidden transition-all duration-300`}
            >
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                onFocus={() => handleFocus("password")}
                onBlur={() => handleBlur("password")}
                className="flex-1 px-3 sm:px-4 py-2.5 text-sm sm:text-base focus:outline-none"
                required
              />
              <div className="px-3 border-l border-gray-300 h-full flex items-center justify-center">
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className={`text-gray-500 cursor-pointer hover:text-${themeColor}-600`}
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full bg-${themeColor}-600 hover:bg-${themeColor}-500 text-white cursor-pointer font-bold py-2.5 sm:py-3 rounded-full shadow-md text-sm sm:text-base transition duration-300 ${
              loading ? "opacity-70 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Login;
