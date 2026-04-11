import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { complaintApi, bookingApi } from "@/services/apiService";
import { motion } from "framer-motion";
import { Search, Eye, BookOpen, Save, Loader, Edit, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminComplaints() {
  const [search, setSearch] = useState("");
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    booking_id: "",
    booked_date: "",
    manufacturer_status: "",
    reference_no: "",
    notes: "",
  });
  const [statusUpdate, setStatusUpdate] = useState<string>("Pending");
  const [editingComplaint, setEditingComplaint] = useState<boolean>(false);
  const [editComplaintForm, setEditComplaintForm] = useState({
    customer_name: "",
    customer_phone: "",
    customer_email: "",
    customer_address: "",
    issue_description: "",
  });
  const [editingBooking, setEditingBooking] = useState<boolean>(false);
  const [editBookingForm, setEditBookingForm] = useState({
    booking_id: "",
    manufacturer_status: "",
    reference_no: "",
    notes: "",
  });

  // Helper function to get manufacturer booking for a complaint
  const getManufacturerUpdate = (complaintId: number) => {
    return bookings.find((b) => b.complaint_id === complaintId);
  };

  useEffect(() => {
    const fetchComplaints = async () => {
      setLoading(true);
      try {
        const result = await complaintApi.getAll();
        const bookingResult = await bookingApi.getAll();
        
        if (result.success) {
          setComplaints(result.data?.complaints || []);
        }
        if (bookingResult.success) {
          setBookings(bookingResult.data?.bookings || []);
        }
      } catch (error) {
        console.error("Failed to fetch complaints:", error);
        toast.error("Failed to load complaints");
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const filtered = complaints.filter(
    (c) =>
      c.ticket_no?.toLowerCase().includes(search.toLowerCase()) ||
      c.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.serial_no?.toLowerCase().includes(search.toLowerCase()),
  );

  const handleSaveBooking = async () => {
    if (!selectedComplaint) return;
    if (!bookingForm.booking_id) {
      toast.error("Please enter a manufacturer booking ID");
      return;
    }

    setSubmitting(true);
    try {
      // Create booking
      const bookingResult = await bookingApi.create({
        complaintId: selectedComplaint.id,
        bookingId: bookingForm.booking_id,
        bookedDate:
          bookingForm.booked_date || new Date().toISOString().split("T")[0],
        manufacturerStatus: bookingForm.manufacturer_status,
        referenceNo: bookingForm.reference_no,
        notes: bookingForm.notes,
      });

      if (!bookingResult.success) {
        toast.error(bookingResult.error || "Failed to create booking");
        return;
      }

      // Update complaint status
      const statusResult = await complaintApi.updateStatus(
        selectedComplaint.id,
        statusUpdate,
      );
      if (!statusResult.success) {
        toast.error(statusResult.error || "Failed to update status");
        return;
      }

      toast.success("Manufacturer booking saved & ticket status updated");
      setShowBooking(false);
      setSelectedComplaint(null);
      setBookingForm({
        booking_id: "",
        booked_date: "",
        manufacturer_status: "",
        reference_no: "",
        notes: "",
      });

      // Refresh complaints and bookings
      const refreshResult = await complaintApi.getAll();
      const refreshBookings = await bookingApi.getAll();
      if (refreshResult.success) {
        setComplaints(refreshResult.data?.complaints || []);
      }
      if (refreshBookings.success) {
        setBookings(refreshBookings.data?.bookings || []);
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditComplaint = () => {
    if (!selectedComplaint) return;
    setEditComplaintForm({
      customer_name: selectedComplaint.customer_name,
      customer_phone: selectedComplaint.customer_phone,
      customer_email: selectedComplaint.customer_email,
      customer_address: selectedComplaint.customer_address,
      issue_description: selectedComplaint.issue_description,
    });
    setEditingComplaint(true);
  };

  const handleSaveComplaint = async () => {
    if (!selectedComplaint) return;
    setSubmitting(true);
    try {
      const result = await complaintApi.update(selectedComplaint.id, editComplaintForm);
      if (result.success) {
        toast.success("Complaint updated successfully");
        setEditingComplaint(false);
        setSelectedComplaint(null);
        
        // Refresh complaints
        const refreshResult = await complaintApi.getAll();
        if (refreshResult.success) {
          setComplaints(refreshResult.data?.complaints || []);
        }
      } else {
        toast.error(result.error || "Failed to update complaint");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteComplaint = async (complaintId: number) => {
    if (!confirm("Are you sure you want to delete this complaint?")) return;
    
    setSubmitting(true);
    try {
      const result = await complaintApi.delete(complaintId);
      if (result.success) {
        toast.success("Complaint deleted successfully");
        setSelectedComplaint(null);
        
        // Refresh complaints
        const refreshResult = await complaintApi.getAll();
        if (refreshResult.success) {
          setComplaints(refreshResult.data?.complaints || []);
        }
      } else {
        toast.error(result.error || "Failed to delete complaint");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleEditBooking = () => {
    const booking = getManufacturerUpdate(selectedComplaint.id);
    if (!booking) return;
    setEditBookingForm({
      booking_id: booking.booking_id,
      manufacturer_status: booking.manufacturer_status,
      reference_no: booking.reference_no,
      notes: booking.notes || "",
    });
    setEditingBooking(true);
  };

  const handleSaveBookingEdit = async () => {
    const booking = getManufacturerUpdate(selectedComplaint.id);
    if (!booking) return;
    
    setSubmitting(true);
    try {
      const result = await bookingApi.update(booking.id, editBookingForm);
      if (result.success) {
        toast.success("Booking updated successfully");
        setEditingBooking(false);
        
        // Refresh bookings
        const refreshBookings = await bookingApi.getAll();
        if (refreshBookings.success) {
          setBookings(refreshBookings.data?.bookings || []);
        }
      } else {
        toast.error(result.error || "Failed to update booking");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteBooking = async (bookingId: number) => {
    if (!confirm("Are you sure you want to delete this booking?")) return;
    
    setSubmitting(true);
    try {
      const result = await bookingApi.delete(bookingId);
      if (result.success) {
        toast.success("Booking deleted successfully");
        
        // Refresh bookings
        const refreshBookings = await bookingApi.getAll();
        if (refreshBookings.success) {
          setBookings(refreshBookings.data?.bookings || []);
        }
      } else {
        toast.error(result.error || "Failed to delete booking");
      }
    } catch (error) {
      toast.error("An error occurred");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-2xl font-bold mb-1">All Complaints</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Manage agent-submitted complaints and manufacturer bookings
        </p>

        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search complaints..."
            className="w-full pl-9 pr-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                {[
                  "Ticket #",
                  "Agent",
                  "Customer",
                  "Serial",
                  "Status",
                  "Mfg Booking",
                  "Date",
                  "",
                ].map((h) => (
                  <th
                    key={h}
                    className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const mfg = getManufacturerUpdate(c.id);
                return (
                  <motion.tr
                    key={c.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="border-b border-border/30 hover:bg-secondary/30 transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-xs text-primary">
                      {c.ticket_no}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {c.agent_name}
                    </td>
                    <td className="px-4 py-3 text-foreground">
                      {c.customer_name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {c.serial_no}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-xs">
                      {mfg ? (
                        <span className="text-success">{mfg.booking_id}</span>
                      ) : (
                        <span className="text-muted-foreground">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {c.created_at}
                    </td>
                    <td className="px-4 py-3 flex gap-1">
                      <button
                        onClick={() => {
                          setSelectedComplaint(c);
                          setShowBooking(false);
                        }}
                        className="text-primary hover:text-primary/80"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => {
                          setSelectedComplaint(c);
                          setShowBooking(true);
                          setStatusUpdate(c.status);
                        }}
                        className="text-warning hover:text-warning/80"
                      >
                        <BookOpen className="h-4 w-4" />
                      </button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {selectedComplaint && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={() => setSelectedComplaint(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto"
              onClick={(e) => e.stopPropagation()}
            >
              {!showBooking ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display font-bold text-lg">
                      {selectedComplaint.ticket_no}
                    </h2>
                    <StatusBadge status={selectedComplaint.status} />
                  </div>
                  {!editingComplaint ? (
                    <>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {[
                          ["Agent", selectedComplaint.agent_name],
                          ["Customer", selectedComplaint.customer_name],
                          ["Phone", selectedComplaint.customer_phone],
                          ["Email", selectedComplaint.customer_email],
                          ["Address", selectedComplaint.customer_address],
                          ["Serial", selectedComplaint.serial_no],
                          ["Model", selectedComplaint.device_model],
                          ["Purchase Date", selectedComplaint.purchase_date],
                          ["Warranty Expiry", selectedComplaint.warranty_expiry],
                          [
                            "Warranty",
                            selectedComplaint.warranty_valid
                              ? "✓ Active"
                              : "✗ Expired",
                          ],
                        ].map(([l, v]) => (
                          <div key={l}>
                            <p className="text-xs text-muted-foreground">{l}</p>
                            <p className="text-foreground font-medium">{v}</p>
                          </div>
                        ))}
                      </div>
                      <div className="mt-4">
                        <p className="text-xs text-muted-foreground">
                          Issue Description
                        </p>
                        <p className="text-sm text-foreground mt-1">
                          {selectedComplaint.issue_description}
                        </p>
                      </div>
                      {getManufacturerUpdate(selectedComplaint.id) && (
                        <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-medium text-primary">
                              Manufacturer Booking
                            </p>
                            <div className="flex gap-1">
                              <button
                                onClick={handleEditBooking}
                                className="p-1 text-primary hover:bg-secondary/50 rounded"
                              >
                                <Edit className="h-4 w-4" />
                              </button>
                              <button
                                onClick={() => {
                                  const booking = getManufacturerUpdate(selectedComplaint.id);
                                  if (booking) handleDeleteBooking(booking.id);
                                }}
                                className="p-1 text-destructive hover:bg-secondary/50 rounded"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </div>
                          {(() => {
                            const m = getManufacturerUpdate(selectedComplaint.id)!;
                            return (
                              <div className="grid grid-cols-2 gap-3 text-sm">
                                <div>
                                  <p className="text-[10px] text-muted-foreground">
                                    Booking ID
                                  </p>
                                  <p className="text-foreground">{m.booking_id}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-muted-foreground">
                                    Status
                                  </p>
                                  <p className="text-foreground">
                                    {m.manufacturer_status}
                                  </p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-muted-foreground">
                                    Reference
                                  </p>
                                  <p className="text-foreground">{m.reference_no}</p>
                                </div>
                                <div>
                                  <p className="text-[10px] text-muted-foreground">
                                    Notes
                                  </p>
                                  <p className="text-foreground">{m.notes}</p>
                                </div>
                              </div>
                            );
                          })()}
                        </div>
                      )}
                      <div className="mt-5 flex gap-2">
                        <button
                          onClick={handleEditComplaint}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all"
                        >
                          <Edit className="h-4 w-4" /> Edit
                        </button>
                        <button
                          onClick={() => handleDeleteComplaint(selectedComplaint.id)}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:opacity-90 transition-all"
                        >
                          <Trash2 className="h-4 w-4" /> Delete
                        </button>
                        <button
                          onClick={() => {
                            setSelectedComplaint(selectedComplaint);
                            setShowBooking(true);
                          }}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
                        >
                          <BookOpen className="h-4 w-4" /> Add Booking
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <div className="space-y-4">
                        {[
                          {
                            key: "customer_name",
                            label: "Customer Name *",
                            placeholder: "Customer name",
                          },
                          {
                            key: "customer_phone",
                            label: "Phone *",
                            placeholder: "+971...",
                          },
                          {
                            key: "customer_email",
                            label: "Email",
                            placeholder: "customer@email.com",
                          },
                          {
                            key: "customer_address",
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
                              value={editComplaintForm[f.key as keyof typeof editComplaintForm]}
                              onChange={(e) =>
                                setEditComplaintForm((prev) => ({
                                  ...prev,
                                  [f.key]: e.target.value,
                                }))
                              }
                              placeholder={f.placeholder}
                              className="mt-1 w-full px-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                          </div>
                        ))}
                        <div>
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Issue Description
                          </label>
                          <textarea
                            value={editComplaintForm.issue_description}
                            onChange={(e) =>
                              setEditComplaintForm((prev) => ({
                                ...prev,
                                issue_description: e.target.value,
                              }))
                            }
                            placeholder="Describe the issue..."
                            rows={4}
                            className="mt-1 w-full px-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                          />
                        </div>
                      </div>
                      <div className="mt-5 flex gap-2">
                        <button
                          onClick={handleSaveComplaint}
                          disabled={submitting}
                          className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
                        >
                          {submitting ? (
                            <>
                              <Loader className="h-4 w-4 animate-spin" /> Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" /> Save Changes
                            </>
                          )}
                        </button>
                        <button
                          onClick={() => setEditingComplaint(false)}
                          className="flex-1 px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
                        >
                          Cancel
                        </button>
                      </div>
                    </>
                  )}
                </>
              ) : (
                <>
                  {!editingBooking ? (
                    <>
                      <h2 className="font-display font-bold text-lg mb-4">
                        Manufacturer Booking — {selectedComplaint.ticket_no}
                      </h2>
                      <div className="space-y-4">
                        {[
                          {
                            key: "booking_id",
                            label: "Manufacturer Booking ID *",
                            placeholder: "e.g. MFG-HIK-12345",
                          },
                          {
                            key: "booked_date",
                            label: "Booking Date",
                            placeholder: "YYYY-MM-DD",
                            type: "date",
                          },
                          {
                            key: "manufacturer_status",
                            label: "Manufacturer Status",
                            placeholder: "e.g. Under Review",
                          },
                          {
                            key: "reference_no",
                            label: "Reference Number",
                            placeholder: "e.g. REF-2026-XXXX",
                          },
                        ].map((f) => (
                          <div key={f.key}>
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              {f.label}
                            </label>
                            <input
                              type={f.type || "text"}
                              value={bookingForm[f.key as keyof typeof bookingForm]}
                              onChange={(e) =>
                                setBookingForm((prev) => ({
                                  ...prev,
                                  [f.key]: e.target.value,
                                }))
                              }
                              placeholder={f.placeholder}
                              className="mt-1 w-full px-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                          </div>
                        ))}
                        <div>
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Notes
                          </label>
                          <textarea
                            value={bookingForm.notes}
                            onChange={(e) =>
                              setBookingForm((prev) => ({
                                ...prev,
                                notes: e.target.value,
                              }))
                            }
                            placeholder="Internal notes..."
                            rows={3}
                            className="mt-1 w-full px-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                          />
                        </div>
                        <div>
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Update Ticket Status
                          </label>
                          <select
                            value={statusUpdate}
                            onChange={(e) =>
                              setStatusUpdate(e.target.value as any)
                            }
                            className="mt-1 w-full px-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                          >
                            <option>Pending</option>
                            <option>Booked</option>
                            <option>In-Progress</option>
                            <option>Replaced</option>
                            <option>Rejected</option>
                          </select>
                        </div>
                        <button
                          onClick={handleSaveBooking}
                          disabled={submitting}
                          className="w-full flex items-center justify-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-50"
                        >
                          {submitting ? (
                            <>
                              <Loader className="h-4 w-4 animate-spin" /> Saving...
                            </>
                          ) : (
                            <>
                              <Save className="h-4 w-4" /> Save Booking
                            </>
                          )}
                        </button>
                      </div>
                    </>
                  ) : (
                    <>
                      <h2 className="font-display font-bold text-lg mb-4">
                        Edit Booking — {selectedComplaint.ticket_no}
                      </h2>
                      <div className="space-y-4">
                        {[
                          {
                            key: "booking_id",
                            label: "Manufacturer Booking ID *",
                            placeholder: "e.g. MFG-HIK-12345",
                          },
                          {
                            key: "manufacturer_status",
                            label: "Manufacturer Status",
                            placeholder: "e.g. Under Review",
                          },
                          {
                            key: "reference_no",
                            label: "Reference Number",
                            placeholder: "e.g. REF-2026-XXXX",
                          },
                        ].map((f) => (
                          <div key={f.key}>
                            <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                              {f.label}
                            </label>
                            <input
                              type="text"
                              value={editBookingForm[f.key as keyof typeof editBookingForm]}
                              onChange={(e) =>
                                setEditBookingForm((prev) => ({
                                  ...prev,
                                  [f.key]: e.target.value,
                                }))
                              }
                              placeholder={f.placeholder}
                              className="mt-1 w-full px-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
                            />
                          </div>
                        ))}
                        <div>
                          <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">
                            Notes
                          </label>
                          <textarea
                            value={editBookingForm.notes}
                            onChange={(e) =>
                              setEditBookingForm((prev) => ({
                                ...prev,
                                notes: e.target.value,
                              }))
                            }
                            placeholder="Internal notes..."
                            rows={3}
                            className="mt-1 w-full px-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none"
                          />
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={handleSaveBookingEdit}
                            disabled={submitting}
                            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:opacity-90 transition-all disabled:opacity-50"
                          >
                            {submitting ? (
                              <>
                                <Loader className="h-4 w-4 animate-spin" /> Saving...
                              </>
                            ) : (
                              <>
                                <Save className="h-4 w-4" /> Save Changes
                              </>
                            )}
                          </button>
                          <button
                            onClick={() => setEditingBooking(false)}
                            className="flex-1 px-4 py-2 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
                          >
                            Cancel
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}

              <button
                onClick={() => setSelectedComplaint(null)}
                className="mt-5 w-full py-2 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors"
              >
                Close
              </button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
