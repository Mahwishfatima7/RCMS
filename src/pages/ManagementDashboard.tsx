import { useEffect, useState } from "react";
import { AppLayout } from "@/components/AppLayout";
import { StatCard } from "@/components/StatCard";
import { complaintApi, analyticsApi } from "@/services/apiService";
import { motion } from "framer-motion";
import {
  ClipboardList,
  CheckCircle,
  Clock,
  XCircle,
  Truck,
  Loader,
} from "lucide-react";
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";

const COLORS = [
  "hsl(38, 92%, 50%)",
  "hsl(200, 72%, 47%)",
  "hsl(210, 80%, 55%)",
  "hsl(142, 71%, 45%)",
  "hsl(0, 72%, 51%)",
];

const monthlyData = [
  { month: "Oct", complaints: 8, resolved: 6 },
  { month: "Nov", complaints: 12, resolved: 10 },
  { month: "Dec", complaints: 6, resolved: 5 },
  { month: "Jan", complaints: 15, resolved: 11 },
  { month: "Feb", complaints: 10, resolved: 9 },
  { month: "Mar", complaints: 5, resolved: 2 },
];

export default function ManagementDashboard() {
  const [dashboard, setDashboard] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const result = await analyticsApi.getDashboard();
        if (result.success) {
          setDashboard(result.data);
        }
      } catch (error) {
        console.error("Failed to fetch dashboard:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const statusCounts = dashboard?.statusDistribution || {
    Pending: 0,
    Booked: 0,
    "In-Progress": 0,
    Replaced: 0,
    Rejected: 0,
  };

  const pieData = Array.isArray(statusCounts)
    ? statusCounts.map((item: any) => ({
        name: item.status,
        value: item.count,
      }))
    : Object.entries(statusCounts).map(([name, value]) => ({
        name,
        value,
      }));

  // Calculate resolved and pending complaints from statusDistribution
  const resolvedComplaints = Array.isArray(statusCounts)
    ? statusCounts
        .filter((item: any) =>
          ["Replaced", "Rejected"].includes(item.status),
        )
        .reduce((sum, item: any) => sum + (item.count || 0), 0)
    : (statusCounts.Replaced || 0) + (statusCounts.Rejected || 0);

  const pendingComplaints = Array.isArray(statusCounts)
    ? statusCounts
        .filter((item: any) =>
          ["Pending", "Booked", "In-Progress"].includes(item.status),
        )
        .reduce((sum, item: any) => sum + (item.count || 0), 0)
    : (statusCounts.Pending || 0) +
      (statusCounts.Booked || 0) +
      (statusCounts["In-Progress"] || 0);

  const warrantyExpired = dashboard?.warrantyExpired || 0;

  if (loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen gap-2">
          <Loader className="h-6 w-6 animate-spin" />
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-6">
          RCMS Overview & Analytics
        </p>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard
            label="Total"
            value={dashboard?.totalComplaints || 0}
            icon={ClipboardList}
          />
          <StatCard
            label="Pending"
            value={
              Array.isArray(statusCounts)
                ? statusCounts.find((s: any) => s.status === "Pending")
                    ?.count || 0
                : statusCounts.Pending || 0
            }
            icon={Clock}
            colorClass="text-warning"
          />
          <StatCard
            label="Booked"
            value={
              Array.isArray(statusCounts)
                ? statusCounts.find((s: any) => s.status === "Booked")?.count ||
                  0
                : statusCounts.Booked || 0
            }
            icon={CheckCircle}
            colorClass="text-info"
          />
          <StatCard
            label="In Progress"
            value={
              Array.isArray(statusCounts)
                ? statusCounts.find((s: any) => s.status === "In-Progress")
                    ?.count || 0
                : statusCounts["In-Progress"] || 0
            }
            icon={Truck}
            colorClass="text-primary"
          />
          <StatCard
            label="Replaced"
            value={
              Array.isArray(statusCounts)
                ? statusCounts.find((s: any) => s.status === "Replaced")
                    ?.count || 0
                : statusCounts.Replaced || 0
            }
            icon={CheckCircle}
            colorClass="text-success"
          />
          <StatCard
            label="Rejected"
            value={
              Array.isArray(statusCounts)
                ? statusCounts.find((s: any) => s.status === "Rejected")
                    ?.count || 0
                : statusCounts.Rejected || 0
            }
            icon={XCircle}
            colorClass="text-destructive"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-5"
          >
            <h3 className="font-display font-semibold text-sm mb-4">
              Status Distribution
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((_, i) => (
                    <Cell key={i} fill={COLORS[i]} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: "hsl(216, 45%, 16%)",
                    border: "1px solid hsl(216, 30%, 25%)",
                    borderRadius: "8px",
                    color: "hsl(210, 40%, 96%)",
                  }}
                />
                <Legend wrapperStyle={{ fontSize: "12px" }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-card rounded-xl p-5"
          >
            <h3 className="font-display font-semibold text-sm mb-4">
              Monthly Trends
            </h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={dashboard?.monthlyTrends || monthlyData}>
                <CartesianGrid
                  strokeDasharray="3 3"
                  stroke="hsl(216, 30%, 25%)"
                />
                <XAxis
                  dataKey="month"
                  tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }}
                />
                <YAxis tick={{ fill: "hsl(215, 20%, 55%)", fontSize: 12 }} />
                <Tooltip
                  contentStyle={{
                    background: "hsl(216, 45%, 16%)",
                    border: "1px solid hsl(216, 30%, 25%)",
                    borderRadius: "8px",
                    color: "hsl(210, 40%, 96%)",
                  }}
                />
                <Bar
                  dataKey="submitted"
                  fill="hsl(200, 72%, 47%)"
                  radius={[4, 4, 0, 0]}
                />
                <Bar
                  dataKey="resolved"
                  fill="hsl(142, 71%, 45%)"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-display font-semibold text-sm mb-3">
              Warranty Analysis
            </h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Active Warranty</span>
                  <span className="text-success font-medium">
                    {(dashboard?.totalComplaints || 0) -
                      (dashboard?.warrantyExpired || 0)}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full"
                    style={{
                      width: `${dashboard?.totalComplaints ? ((dashboard.totalComplaints - (dashboard.warrantyExpired || 0)) / dashboard.totalComplaints) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Expired</span>
                  <span className="text-destructive font-medium">
                    {dashboard?.warrantyExpired || 0}
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-destructive rounded-full"
                    style={{
                      width: `${dashboard?.totalComplaints ? ((dashboard.warrantyExpired || 0) / dashboard.totalComplaints) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-display font-semibold text-sm mb-4">
              Complaint Resolution Rate
            </h3>
            <div className="space-y-3">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground">Resolved</span>
                  <span className="text-sm font-semibold text-success">
                    {dashboard?.totalComplaints > 0
                      ? Math.round(
                          (resolvedComplaints /
                            dashboard?.totalComplaints) *
                            100,
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-success rounded-full transition-all"
                    style={{
                      width: `${dashboard?.totalComplaints > 0 ? (resolvedComplaints / dashboard?.totalComplaints) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs text-muted-foreground">Pending</span>
                  <span className="text-sm font-semibold text-warning">
                    {dashboard?.totalComplaints > 0
                      ? Math.round(
                          (pendingComplaints /
                            dashboard?.totalComplaints) *
                            100,
                        )
                      : 0}
                    %
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div
                    className="h-full bg-warning rounded-full transition-all"
                    style={{
                      width: `${dashboard?.totalComplaints > 0 ? (pendingComplaints / dashboard?.totalComplaints) * 100 : 0}%`,
                    }}
                  />
                </div>
              </div>
              <div className="pt-2">
                <p className="text-xs text-muted-foreground">
                  <span className="font-medium text-foreground">
                    {resolvedComplaints}
                  </span>
                  {" "}of{" "}
                  <span className="font-medium text-foreground">
                    {dashboard?.totalComplaints || 0}
                  </span>
                  {" "}resolved
                </p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
