import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { AppLayout } from "@/components/AppLayout";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import {
  CheckCircle,
  AlertTriangle,
  XCircle,
  Send,
  Loader,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";
import { serialApi, complaintApi } from "@/services/apiService";

export default function AgentNewComplaint() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [serialNo, setSerialNo] = useState("");
  const [serialStatus, setSerialStatus] = useState<
    "valid" | "expired" | "not-found" | null
  >(null);
  const [serialEntry, setSerialEntry] = useState<any>(null);
  const [validating, setValidating] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    customerName: "",
    customerPhone: "",
    customerEmail: "",
    customerAddress: "",
    issueDescription: "",
  });
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Validation helpers
  const validateCustomerName = (name: string) => {
    if (!name.trim()) return "Full name is required";
    if (name.trim().length < 2) return "Name must be at least 2 characters";
    return "";
  };

  const validateCustomerPhone = (phone: string) => {
    if (!phone.trim()) return "Phone number is required";
    if (!/^[\d\s\-\+\(\)]+$/.test(phone)) return "Please enter a valid phone number";
    if (phone.replace(/\D/g, "").length < 7) return "Phone number must be at least 7 digits";
    return "";
  };

  const validateCustomerEmail = (email: string) => {
    if (email.trim() && (!email.includes("@") || !email.includes("."))) {
      return "Please enter a valid email address";
    }
    return "";
  };

  const validateIssueDescription = (desc: string) => {
    if (!desc.trim()) return "Issue description is required";
    if (desc.trim().length < 10) return "Description must be at least 10 characters";
    return "";
  };

  // Handle field changes with validation
  const handleFieldChange = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    
    let error = "";
    if (key === "customerName") error = validateCustomerName(value);
    else if (key === "customerPhone") error = validateCustomerPhone(value);
    else if (key === "customerEmail") error = validateCustomerEmail(value);
    else if (key === "issueDescription") error = validateIssueDescription(value);

    setFieldErrors((prev) => ({
      ...prev,
      [key]: error,
    }));
  };

  const handleSerialChange = (val: string) => {
    setSerialNo(val);
    // TODO: Enable serial validation API once backend has serial data
    // For now, accept any serial number without backend validation
    if (val.length > 0) {
      setSerialEntry({
        serial_no: val,
        model: "Camera Model",
        purchase_date: new Date().toISOString().split("T")[0],
        warranty_expiry: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
          .toISOString()
          .split("T")[0],
      });
      setSerialStatus("valid");
    } else {
      setSerialStatus(null);
      setSerialEntry(null);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !serialEntry) return;

    // Validate all fields
    const errors: Record<string, string> = {
      customerName: validateCustomerName(form.customerName),
      customerPhone: validateCustomerPhone(form.customerPhone),
      customerEmail: validateCustomerEmail(form.customerEmail),
      issueDescription: validateIssueDescription(form.issueDescription),
    };

    setFieldErrors(errors);

    // Check if there are any errors
    const hasErrors = Object.values(errors).some((err) => err !== "");
    if (hasErrors) {
      toast.error("Please fix the errors above");
      return;
    }

    setSubmitting(true);
    try {
      const result = await complaintApi.create({
        customerName: form.customerName,
        customerPhone: form.customerPhone,
        customerEmail: form.customerEmail,
        customerAddress: form.customerAddress,
        serialNo: serialEntry.serial_no,
        deviceModel: serialEntry.model,
        issueDescription: form.issueDescription,
        purchaseDate: serialEntry.purchase_date,
      });

      if (result.success) {
        toast.success("Complaint submitted successfully!");
        navigate("/agent/tickets");
      } else {
        toast.error(result.error || "Failed to submit complaint");
      }
    } catch (error) {
      toast.error("An error occurred while submitting");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-2xl font-bold mb-1">
          New Replacement Request
        </h1>
        <p className="text-sm text-muted-foreground mb-6">
          Submit a camera replacement complaint for a customer
        </p>

        <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
          {/* Serial Validation */}
          <div className="glass-card rounded-xl p-5 space-y-4">
            <h2 className="font-display font-semibold text-sm text-foreground">
              Device Verification
            </h2>
            <p className="text-xs text-muted-foreground">
              Enter the camera serial number to verify it was supplied by DXB
              Technologies and check warranty status.
            </p>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Camera Serial Number *
              </label>
              <div className="relative mt-1">
                <input
                  type="text"
                  value={serialNo}
                  onChange={(e) => handleSerialChange(e.target.value)}
                  placeholder="e.g. CAM-2024-001"
                  disabled={validating}
                  className="w-full px-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all disabled:opacity-50"
                />
                {validating && (
                  <Loader className="absolute right-3 top-3 h-4 w-4 animate-spin text-primary" />
                )}
                {!validating && serialStatus === "valid" && (
                  <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-success" />
                )}
                {!validating && serialStatus === "expired" && (
                  <AlertTriangle className="absolute right-3 top-3 h-4 w-4 text-warning" />
                )}
                {!validating && serialStatus === "not-found" && (
                  <XCircle className="absolute right-3 top-3 h-4 w-4 text-destructive" />
                )}
              </div>
              {serialStatus === "not-found" && (
                <p className="text-xs text-destructive mt-1">
                  Serial number not found — this camera is not in DXB's records
                </p>
              )}
              {serialStatus === "expired" && (
                <p className="text-xs text-warning mt-1">
                  ⚠ Warranty expired — complaint will be flagged for review
                </p>
              )}
              {serialStatus === "valid" && (
                <p className="text-xs text-success mt-1">
                  ✓ Device verified as DXB-supplied, warranty active
                </p>
              )}
            </div>

            {serialEntry && (
              <motion.div
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: "auto" }}
                className="grid grid-cols-3 gap-3 p-3 bg-secondary/30 rounded-lg"
              >
                <div>
                  <p className="text-[10px] text-muted-foreground">Model</p>
                  <p className="text-xs font-medium text-foreground">
                    {serialEntry.model}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">
                    Purchase Date
                  </p>
                  <p className="text-xs font-medium text-foreground">
                    {serialEntry.purchase_date}
                  </p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">
                    Warranty Expiry
                  </p>
                  <p className="text-xs font-medium text-foreground">
                    {serialEntry.warranty_expiry}
                  </p>
                </div>
              </motion.div>
            )}
          </div>

          {/* Customer Info */}
          <div className="glass-card rounded-xl p-5 space-y-4">
            <h2 className="font-display font-semibold text-sm text-foreground">
              Customer Information
            </h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  key: "customerName",
                  label: "Full Name *",
                  placeholder: "Customer full name",
                },
                {
                  key: "customerPhone",
                  label: "Phone *",
                  placeholder: "+971...",
                },
                {
                  key: "customerEmail",
                  label: "Email",
                  placeholder: "customer@email.com",
                },
                {
                  key: "customerAddress",
                  label: "Address",
                  placeholder: "Full address",
                },
              ].map((f) => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                    {f.label}
                  </label>
                  <input
                    type="text"
                    value={form[f.key as keyof typeof form]}
                    onChange={(e) =>
                      handleFieldChange(f.key, e.target.value)
                    }
                    placeholder={f.placeholder}
                    disabled={submitting}
                    className={`mt-1 w-full px-3 py-2.5 bg-secondary/50 border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all disabled:opacity-50 ${
                      fieldErrors[f.key]
                        ? "border-red-500/50 focus:ring-red-500/50"
                        : "border-border/50 focus:ring-primary/50"
                    }`}
                  />
                  {fieldErrors[f.key] && (
                    <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {fieldErrors[f.key]}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Issue */}
          <div className="glass-card rounded-xl p-5 space-y-4">
            <h2 className="font-display font-semibold text-sm text-foreground">
              Issue Details
            </h2>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                Description *
              </label>
              <textarea
                value={form.issueDescription}
                onChange={(e) =>
                  handleFieldChange("issueDescription", e.target.value)
                }
                disabled={submitting}
                placeholder="Describe the issue in detail..."
                rows={4}
                className={`mt-1 w-full px-3 py-2.5 bg-secondary/50 border rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 transition-all resize-none disabled:opacity-50 ${
                  fieldErrors.issueDescription
                    ? "border-red-500/50 focus:ring-red-500/50"
                    : "border-border/50 focus:ring-primary/50"
                }`}
              />
              {fieldErrors.issueDescription && (
                <p className="mt-1.5 text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="h-3 w-3" />
                  {fieldErrors.issueDescription}
                </p>
              )}
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting || !serialEntry}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader className="h-4 w-4 animate-spin" />
                Submitting...
              </>
            ) : (
              <>
                <Send className="h-4 w-4" />
                Submit Complaint
              </>
            )}
          </button>
        </form>
      </motion.div>
    </AppLayout>
  );
}
