import { useState } from "react";
import { motion } from "framer-motion";
import { AlertCircle, Loader, Check, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth-context";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

const BASE_URL = import.meta.env.DEV
  ? "/api"
  : import.meta.env.VITE_API_BASE_URL || "http://localhost:5000/api";

interface APIResponse {
  success: boolean;
  error?: string;
  message?: string;
  data?: {
    agent: {
      id: number;
      name: string;
      email: string;
      role: string;
      contact_no?: string;
      emergency_contact?: string;
      phone?: string;
      department?: string;
      created_at?: string;
    };
  };
}

interface AgentData {
  id: number;
  name: string;
  email: string;
  role: string;
  contact_no?: string;
  emergency_contact?: string;
  phone?: string;
  department?: string;
  created_at?: string;
}

export function AgentRegistrationForm({ autoOpen = false }: { autoOpen?: boolean }) {
  const [isOpen, setIsOpen] = useState(autoOpen);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    contact_no: "",
    emergency_contact: "",
    password: "",
    confirmPassword: "",
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [successData, setSuccessData] = useState<AgentData | null>(null);
  const [successPassword, setSuccessPassword] = useState("");
  const { user } = useAuth();

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      contact_no: "",
      emergency_contact: "",
      password: "",
      confirmPassword: "",
    });
    setError("");
    setFieldErrors({});
    setShowPassword(false);
    setShowConfirmPassword(false);
    setSuccessPassword("");
  };

  const validateField = (field: string, value: string) => {
    switch (field) {
      case "name":
        if (!value.trim()) return "Employee name is required";
        if (value.trim().length < 3) return "Name must be at least 3 characters";
        return "";
      case "email":
        if (!value.trim()) return "Email is required";
        if (!value.includes("@") || !value.includes("."))
          return "Please enter a valid email";
        return "";
      case "contact_no":
        if (!value.trim()) return "Contact number is required";
        if (!/^[\d\+\-\(\)\s]+$/.test(value))
          return "Please enter a valid contact number";
        return "";
      case "emergency_contact":
        if (!value.trim()) return "Emergency contact is required";
        if (!/^[\d\+\-\(\)\s]+$/.test(value))
          return "Please enter a valid contact number";
        return "";
      case "password":
        if (!value) return "Password is required";
        if (value.length < 8) return "Password must be at least 8 characters";
        if (!/[a-z]/.test(value))
          return "Password must contain lowercase letter";
        if (!/[A-Z]/.test(value))
          return "Password must contain uppercase letter";
        if (!/[0-9]/.test(value)) return "Password must contain a digit";
        if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(value))
          return "Password must contain a special character";
        return "";
      case "confirmPassword":
        if (!value) return "Please confirm your password";
        if (value !== formData.password) return "Passwords do not match";
        return "";
      default:
        return "";
    }
  };

  const handleFieldChange = (field: string, value: string) => {
    setFormData({ ...formData, [field]: value });
    setFieldErrors({
      ...fieldErrors,
      [field]: validateField(field, value),
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSuccessData(null);

    // Validate all fields
    const newErrors: Record<string, string> = {};
    Object.keys(formData).forEach((field) => {
      const fieldError = validateField(field, formData[field as keyof typeof formData]);
      if (fieldError) newErrors[field] = fieldError;
    });

    setFieldErrors(newErrors);
    if (Object.keys(newErrors).length > 0) {
      setError("Please fix the errors above");
      return;
    }

    setLoading(true);
    try {
      const token = localStorage.getItem("auth_token");
      if (!token) {
        throw new Error("No authentication token found");
      }

      const response = await fetch(`${BASE_URL}/auth/agents`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          employee_id: formData.employee_id,
          email: formData.email,
          contact_no: formData.contact_no,
          emergency_contact: formData.emergency_contact,
          password: formData.password,
        }),
      });

      const data: APIResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to create agent");
      }

      if (data.success && data.data?.agent) {
        setSuccessData(data.data.agent);
        setSuccessPassword(formData.password);
        resetForm();
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create agent",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all"
      >
        Register New Agent
      </button>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Register New Agent</DialogTitle>
            <DialogDescription>
              Create a new agent account with employee details
            </DialogDescription>
          </DialogHeader>

          {successData ? (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="space-y-4 py-4"
            >
              <div className="p-4 bg-green-500/10 border border-green-500/20 rounded-lg">
                <p className="text-sm text-green-600 font-medium">
                  Agent created successfully!
                </p>
              </div>

              <div className="space-y-3 bg-secondary/30 rounded-lg p-4">
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">
                    Employee Name
                  </label>
                  <p className="text-sm text-foreground mt-1">{successData.name}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">
                    Email
                  </label>
                  <p className="text-sm text-foreground mt-1">{successData.email}</p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">
                    Contact Number
                  </label>
                  <p className="text-sm text-foreground mt-1">
                    {successData.contact_no}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">
                    Emergency Contact
                  </label>
                  <p className="text-sm text-foreground mt-1">
                    {successData.emergency_contact}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">
                    Role
                  </label>
                  <p className="text-sm text-foreground capitalize mt-1">
                    {successData.role}
                  </p>
                </div>
                <div>
                  <label className="text-xs font-medium text-muted-foreground uppercase">
                    Password
                  </label>
                  <p className="text-sm text-foreground mt-1">
                    {successPassword}
                  </p>
                </div>
                {successData.created_at && (
                  <div>
                    <label className="text-xs font-medium text-muted-foreground uppercase">
                      Created At
                    </label>
                    <p className="text-sm text-foreground mt-1">
                      {new Date(successData.created_at).toLocaleDateString()}
                    </p>
                  </div>
                )}
              </div>

              <div className="p-3 bg-blue-500/10 border border-blue-500/20 rounded-lg text-xs text-blue-600">
                <p className="font-medium mb-1">Important:</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>Agent is ready to login with their credentials</li>
                  <li>They can change their password after first login</li>
                </ul>
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  onClick={() => setIsOpen(false)}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all"
                >
                  Done
                </button>
                <button
                  onClick={() => {
                    setSuccessData(null);
                    resetForm();
                  }}
                  className="flex-1 px-4 py-2 rounded-lg border border-border/50 text-sm font-medium hover:bg-secondary transition-all"
                >
                  Register Another
                </button>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3 py-4">
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg"
                >
                  <AlertCircle className="h-4 w-4 text-red-500 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-red-600">{error}</p>
                </motion.div>
              )}

              {/* Employee Name */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Employee Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleFieldChange("name", e.target.value)}
                  placeholder="e.g., Ahmed Khan"
                  disabled={loading}
                  className={`mt-1 w-full px-3 py-2 bg-secondary/50 border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                    fieldErrors.name
                      ? "border-red-500/50 focus:ring-red-500/50"
                      : "border-border/50 focus:ring-primary/50"
                  }`}
                />
                {fieldErrors.name && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Email Address *
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleFieldChange("email", e.target.value)}
                  placeholder=""
                  disabled={loading}
                  className={`mt-1 w-full px-3 py-2 bg-secondary/50 border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                    fieldErrors.email
                      ? "border-red-500/50 focus:ring-red-500/50"
                      : "border-border/50 focus:ring-primary/50"
                  }`}
                />
                {fieldErrors.email && (
                  <p className="mt-1 text-xs text-red-500">{fieldErrors.email}</p>
                )}
              </div>

              {/* Contact Number */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Contact Number *
                </label>
                <input
                  type="tel"
                  value={formData.contact_no}
                  onChange={(e) => handleFieldChange("contact_no", e.target.value)}
                  placeholder="e.g., +971-50-XXXX-XXXX"
                  disabled={loading}
                  className={`mt-1 w-full px-3 py-2 bg-secondary/50 border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                    fieldErrors.contact_no
                      ? "border-red-500/50 focus:ring-red-500/50"
                      : "border-border/50 focus:ring-primary/50"
                  }`}
                />
                {fieldErrors.contact_no && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.contact_no}
                  </p>
                )}
              </div>

              {/* Emergency Contact */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Emergency Contact *
                </label>
                <input
                  type="tel"
                  value={formData.emergency_contact}
                  onChange={(e) =>
                    handleFieldChange("emergency_contact", e.target.value)
                  }
                  placeholder="e.g., +971-50-XXXX-XXXX"
                  disabled={loading}
                  className={`mt-1 w-full px-3 py-2 bg-secondary/50 border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                    fieldErrors.emergency_contact
                      ? "border-red-500/50 focus:ring-red-500/50"
                      : "border-border/50 focus:ring-primary/50"
                  }`}
                />
                {fieldErrors.emergency_contact && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.emergency_contact}
                  </p>
                )}
              </div>

              {/* Password */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Password *
                </label>
                <div className="relative mt-1">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={(e) => handleFieldChange("password", e.target.value)}
                    placeholder=""
                    disabled={loading}
                    className={`w-full px-3 py-2 pr-10 bg-secondary/50 border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                      fieldErrors.password
                        ? "border-red-500/50 focus:ring-red-500/50"
                        : "border-border/50 focus:ring-primary/50"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {fieldErrors.password && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Confirm Password *
                </label>
                <div className="relative mt-1">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    value={formData.confirmPassword}
                    onChange={(e) =>
                      handleFieldChange("confirmPassword", e.target.value)
                    }
                    placeholder="Re-enter password"
                    disabled={loading}
                    className={`w-full px-3 py-2 pr-10 bg-secondary/50 border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                      fieldErrors.confirmPassword
                        ? "border-red-500/50 focus:ring-red-500/50"
                        : "border-border/50 focus:ring-primary/50"
                    }`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                {fieldErrors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-500">
                    {fieldErrors.confirmPassword}
                  </p>
                )}
              </div>

              <div className="flex gap-2 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setIsOpen(false);
                    resetForm();
                  }}
                  disabled={loading}
                  className="flex-1 px-4 py-2 rounded-lg border border-border/50 text-sm font-medium hover:bg-secondary transition-all disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading || Object.values(fieldErrors).some((err) => err)}
                  className="flex-1 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all disabled:opacity-40"
                >
                  {loading ? (
                    <>
                      <Loader className="h-4 w-4 animate-spin inline mr-2" />
                      Creating...
                    </>
                  ) : (
                    "Create Agent"
                  )}
                </button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
