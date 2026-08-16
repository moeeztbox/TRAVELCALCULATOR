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
  AlertCircle,
} from "lucide-react";
import api from "../api/axios";
import { useAuth } from "../context/AuthContext";
import logo from "../assets/logo-mark.png";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const type = location.state?.type || "user"; // default is user
  const sessionMessage = location.state?.message || "";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const isAdmin = type === "admin";
  const title = isAdmin ? "Welcome back, Admin" : "Welcome back";
  const subtitle = isAdmin
    ? "Sign in to manage your travel operations"
    : "Sign in to continue your journey";

  const Icon = isAdmin ? Shield : Users;
  const accentBtn = isAdmin
    ? "bg-gold-500 text-brand-900 hover:bg-gold-600 hover:text-white"
    : "bg-brand-600 text-white hover:bg-brand-700";
  const accentSoft = isAdmin
    ? "bg-gold-100 text-gold-600"
    : "bg-brand-50 text-brand-600";

  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post("/auth/login", { email, password });

      if (res.data.success) {
        // The backend sets an httpOnly session cookie on this response.
        login(res.data.user);
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
    <div className="flex-1 grid lg:grid-cols-2">
      {/* Left brand panel */}
      <div className="relative hidden lg:flex flex-col p-12 overflow-hidden bg-brand-900 text-white">
        <div
          className="absolute inset-0 opacity-90"
          style={{
            background:
              "radial-gradient(700px 400px at 20% 10%, rgba(47,128,201,0.35), transparent 60%), radial-gradient(600px 400px at 90% 90%, rgba(212,161,58,0.18), transparent 55%)",
          }}
        />
        <div className="relative flex items-center gap-3">
          <div className="grid place-items-center w-11 h-11 rounded-xl bg-white">
            <img
              src={logo}
              alt="AlBuraq Global"
              className="w-8 h-8 object-contain"
            />
          </div>
          <div className="leading-tight">
            <p className="font-bold tracking-wide">AL BURAQ GLOBAL</p>
            <p className="text-[11px] text-brand-300 tracking-[0.25em]">
              TRAVEL &amp; TOURS
            </p>
          </div>
        </div>

        {/* Vertically centered in the remaining space below the brand row */}
        <div className="relative flex-1 flex flex-col justify-center">
          <h2 className="text-4xl font-extrabold leading-tight tracking-tight">
            Crafting
            <br />
            unforgettable
            <br />
            <span className="text-gold-400">journeys.</span>
          </h2>
          <p className="mt-4 text-brand-200 max-w-sm">
            The complete platform to price, manage and quote every part of your
            travel business.
          </p>
        </div>
      </div>

      {/* Right form */}
      <div className="flex flex-col justify-center items-center px-6 py-12 relative">
        <button
          onClick={() => navigate("/")}
          className="absolute top-6 left-6 flex items-center gap-1.5 text-sm text-muted hover:text-ink transition-colors cursor-pointer"
        >
          <ArrowLeft size={18} /> Back
        </button>

        <div className="w-full max-w-sm animate-rise">
          <div
            className={`grid place-items-center w-14 h-14 rounded-2xl mb-6 ${accentSoft}`}
          >
            <Icon size={28} />
          </div>

          <h1 className="text-2xl sm:text-3xl font-bold text-ink tracking-tight">
            {title}
          </h1>
          <p className="text-muted mt-1.5">{subtitle}</p>

          {sessionMessage && (
            <div className="mt-5 flex items-start gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800">
              <AlertCircle size={18} className="shrink-0 mt-0.5" />
              <span>{sessionMessage}</span>
            </div>
          )}

          <form onSubmit={handleLogin} className="mt-8 space-y-5">
            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">
                Email
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soft"
                />
                <input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-11 pr-4 py-3 rounded-xl border border-hair bg-surface-2 text-sm text-ink
                    placeholder-soft focus:outline-none focus:border-brand-400 focus:bg-surface focus:ring-2 focus:ring-brand-100 transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-semibold text-muted mb-1.5 uppercase tracking-wide">
                Password
              </label>
              <div className="relative">
                <Lock
                  size={18}
                  className="absolute left-3.5 top-1/2 -translate-y-1/2 text-soft"
                />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-11 pr-11 py-3 rounded-xl border border-hair bg-surface-2 text-sm text-ink
                    placeholder-soft focus:outline-none focus:border-brand-400 focus:bg-surface focus:ring-2 focus:ring-brand-100 transition-all"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-soft hover:text-ink transition-colors cursor-pointer"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 rounded-xl font-semibold shadow-soft transition-all duration-200 cursor-pointer
                disabled:opacity-70 disabled:cursor-not-allowed ${accentBtn}`}
            >
              {loading ? "Signing in..." : "Sign in"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default Login;
