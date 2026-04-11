import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { UserRole } from "@/lib/mock-data";
import dxbLogo from "@/assets/dxb-logo.png";
import { motion } from "framer-motion";
import {
  Shield,
  Headphones,
  BarChart3,
  ArrowRight,
  AlertCircle,
} from "lucide-react";

const roles: {
  role: UserRole;
  label: string;
  desc: string;
  icon: typeof Shield;
  path: string;
}[] = [
  {
    role: "agent",
    label: "ISP Agent",
    desc: "Submit & track replacement requests",
    icon: Headphones,
    path: "/agent/new",
  },
  {
    role: "admin",
    label: "DXB Admin",
    desc: "Manage complaints & manufacturer bookings",
    icon: Shield,
    path: "/admin/complaints",
  },
  {
    role: "management",
    label: "Management",
    desc: "View dashboard & generate reports",
    icon: BarChart3,
    path: "/management/dashboard",
  },
];

export default function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);

  // Login form
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);

  // Registration form
  const [regFullName, setRegFullName] = useState("");
  const [regEmail, setRegEmail] = useState("");
  const [regUsername, setRegUsername] = useState("");
  const [regPassword, setRegPassword] = useState("");
  const [regConfirmPassword, setRegConfirmPassword] = useState("");
  const [regSelectedRole, setRegSelectedRole] = useState<UserRole | null>(null);
  const [regError, setRegError] = useState("");
  const [regSuccess, setRegSuccess] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedRole) return;
    const roleInfo = roles.find((r) => r.role === selectedRole);
    login(selectedRole);
    navigate(roleInfo?.path || "/");
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError("");

    // Validation
    if (!regFullName.trim()) {
      setRegError("Full name is required");
      return;
    }
    if (!regEmail.includes("@")) {
      setRegError("Please enter a valid email");
      return;
    }
    if (!regUsername.trim() || regUsername.length < 3) {
      setRegError("Username must be at least 3 characters");
      return;
    }
    if (regPassword.length < 6) {
      setRegError("Password must be at least 6 characters");
      return;
    }
    if (regPassword !== regConfirmPassword) {
      setRegError("Passwords do not match");
      return;
    }
    if (!regSelectedRole) {
      setRegError("Please select a role");
      return;
    }

    // Registration successful (in a real app, you'd send this to a backend)
    setRegSuccess(true);
    setTimeout(() => {
      setRegSuccess(false);
      setIsRegistering(false);
      // Reset form
      setRegFullName("");
      setRegEmail("");
      setRegUsername("");
      setRegPassword("");
      setRegConfirmPassword("");
      setRegSelectedRole(null);
    }, 2000);
  };

  const toggleMode = () => {
    setIsRegistering(!isRegistering);
    setRegError("");
    setRegSuccess(false);
    setUsername("");
    setPassword("");
    setSelectedRole(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden">
      {/* Background effects */}
      <div
        className="absolute inset-0 opacity-30"
        style={{
          background:
            "radial-gradient(ellipse at 30% 20%, hsl(200 72% 47% / 0.15), transparent 50%), radial-gradient(ellipse at 70% 80%, hsl(216 50% 20% / 0.3), transparent 50%)",
        }}
      />

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="glass-card rounded-2xl p-8 w-full max-w-md relative z-10"
      >
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <img
              src={dxbLogo}
              alt="DXB Technologies"
              className="h-16 w-16 object-contain"
            />
          </div>
          <h1 className="font-display text-2xl font-bold text-foreground">
            RCMS
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Replacement Case Management System
          </p>
        </div>

        {/* Toggle between Login and Register */}
        <div className="flex gap-2 mb-6 bg-secondary/50 p-1 rounded-lg">
          <button
            type="button"
            onClick={() => !isRegistering && toggleMode()}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              !isRegistering
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign In
          </button>
          <button
            type="button"
            onClick={() => isRegistering && toggleMode()}
            className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-all ${
              isRegistering
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Sign Up
          </button>
        </div>

        {/* LOGIN FORM */}
        {!isRegistering ? (
          <form onSubmit={handleLogin} className="space-y-5">
            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Select Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => (
                  <button
                    type="button"
                    key={r.role}
                    onClick={() => setSelectedRole(r.role)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200 ${
                      selectedRole === r.role
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 text-muted-foreground hover:border-primary/30 hover:bg-secondary/30"
                    }`}
                  >
                    <r.icon className="h-5 w-5" />
                    <span className="text-[10px] font-medium leading-tight">
                      {r.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Username
                </label>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Enter username"
                  className="mt-1 w-full px-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter password"
                  className="mt-1 w-full px-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={!selectedRole}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              Sign In
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        ) : (
          /* REGISTRATION FORM */
          <form onSubmit={handleRegister} className="space-y-4">
            {/* Error Message */}
            {regError && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
              >
                <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                <p className="text-sm text-red-600">{regError}</p>
              </motion.div>
            )}

            {/* Success Message */}
            {regSuccess && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                className="p-3 bg-green-500/10 border border-green-500/30 rounded-lg text-sm text-green-600 text-center font-medium"
              >
                Registration successful! Redirecting...
              </motion.div>
            )}

            {/* Full Name */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Full Name
              </label>
              <input
                type="text"
                value={regFullName}
                onChange={(e) => setRegFullName(e.target.value)}
                placeholder="Enter full name"
                className="mt-1 w-full px-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            {/* Email */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Email
              </label>
              <input
                type="email"
                value={regEmail}
                onChange={(e) => setRegEmail(e.target.value)}
                placeholder="Enter email"
                className="mt-1 w-full px-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            {/* Username */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Username
              </label>
              <input
                type="text"
                value={regUsername}
                onChange={(e) => setRegUsername(e.target.value)}
                placeholder="Choose username (min 3 chars)"
                className="mt-1 w-full px-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            {/* Password */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Password
              </label>
              <input
                type="password"
                value={regPassword}
                onChange={(e) => setRegPassword(e.target.value)}
                placeholder="Min 6 characters"
                className="mt-1 w-full px-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            {/* Confirm Password */}
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Confirm Password
              </label>
              <input
                type="password"
                value={regConfirmPassword}
                onChange={(e) => setRegConfirmPassword(e.target.value)}
                placeholder="Re-enter password"
                className="mt-1 w-full px-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 focus:border-primary transition-all"
              />
            </div>

            {/* Role Selection */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Select Role
              </label>
              <div className="grid grid-cols-3 gap-2">
                {roles.map((r) => (
                  <button
                    type="button"
                    key={r.role}
                    onClick={() => setRegSelectedRole(r.role)}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all duration-200 ${
                      regSelectedRole === r.role
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border/50 text-muted-foreground hover:border-primary/30 hover:bg-secondary/30"
                    }`}
                  >
                    <r.icon className="h-5 w-5" />
                    <span className="text-[10px] font-medium leading-tight">
                      {r.label}
                    </span>
                  </button>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:opacity-90"
            >
              Create Account
              <ArrowRight className="h-4 w-4" />
            </button>
          </form>
        )}

        {!isRegistering && selectedRole && (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center text-xs text-muted-foreground mt-4"
          >
            Signing in as{" "}
            <span className="text-primary font-medium">
              {roles.find((r) => r.role === selectedRole)?.label}
            </span>
          </motion.p>
        )}

        <p className="text-center text-xs text-muted-foreground mt-4">
          {isRegistering
            ? "Already have an account? "
            : "Don't have an account? "}
          <button
            type="button"
            onClick={toggleMode}
            className="text-primary hover:underline font-medium"
          >
            {isRegistering ? "Sign In" : "Sign Up"}
          </button>
        </p>
      </motion.div>
    </div>
  );
}
