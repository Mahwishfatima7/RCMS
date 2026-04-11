import { useState, useEffect } from "react";
import { AppLayout } from "@/components/AppLayout";
import { StatusBadge } from "@/components/StatusBadge";
import { useAuth } from "@/lib/auth-context";
import { motion } from "framer-motion";
import { Search, Eye, Loader } from "lucide-react";
import { complaintApi } from "@/services/apiService";

export default function AgentTickets() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [selected, setSelected] = useState<any>(null);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      if (!user) return;
      setLoading(true);
      try {
        const result = await complaintApi.getByAgent(user.id);
        if (result.success) {
          setComplaints(result.data?.complaints || []);
        }
      } catch (error) {
        console.error("Failed to fetch complaints:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, [user]);

  const filtered = complaints.filter(
    (c) =>
      c.ticket_no?.toLowerCase().includes(search.toLowerCase()) ||
      c.customer_name?.toLowerCase().includes(search.toLowerCase()) ||
      c.serial_no?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-2xl font-bold mb-1">My Tickets</h1>
        <p className="text-sm text-muted-foreground mb-6">
          Track your submitted replacement requests
        </p>

        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="w-full pl-9 pr-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
          />
        </div>

        {loading ? (
          <div className="glass-card rounded-xl p-8 text-center flex items-center justify-center gap-2">
            <Loader className="h-4 w-4 animate-spin" />
            <p className="text-muted-foreground text-sm">Loading tickets...</p>
          </div>
        ) : filtered.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <p className="text-muted-foreground text-sm">
              No tickets found. Submit a new complaint to get started.
            </p>
          </div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  {[
                    "Ticket #",
                    "Customer",
                    "Serial No",
                    "Device",
                    "Status",
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
                {filtered.map((c, i) => (
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
                    <td className="px-4 py-3 text-foreground">
                      {c.customer_name}
                    </td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">
                      {c.serial_no}
                    </td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">
                      {c.device_model}
                    </td>
                    <td className="px-4 py-3">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {c.created_at}
                    </td>
                    <td className="px-4 py-3">
                      <button
                        onClick={() => setSelected(c)}
                        className="text-primary hover:text-primary/80"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {selected && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm"
            onClick={() => setSelected(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-6 max-w-lg w-full mx-4"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-lg">
                  {selected.ticket_no}
                </h2>
                <StatusBadge status={selected.status} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ["Customer", selected.customer_name],
                  ["Phone", selected.customer_phone],
                  ["Serial", selected.serial_no],
                  ["Model", selected.device_model],
                  ["Purchase Date", selected.purchase_date],
                  ["Warranty", selected.warranty_valid ? "Active" : "Expired"],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-foreground font-medium">{val}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">
                  Issue Description
                </p>
                <p className="text-sm text-foreground mt-1">
                  {selected.issue_description}
                </p>
              </div>
              <button
                onClick={() => setSelected(null)}
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
