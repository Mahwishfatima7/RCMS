import { AppLayout } from '@/components/AppLayout';
import { StatCard } from '@/components/StatCard';
import { getComplaints } from '@/lib/complaints-store';
import { motion } from 'framer-motion';
import { ClipboardList, CheckCircle, Clock, AlertTriangle, XCircle, Truck } from 'lucide-react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const COLORS = ['hsl(38, 92%, 50%)', 'hsl(200, 72%, 47%)', 'hsl(210, 80%, 55%)', 'hsl(142, 71%, 45%)', 'hsl(0, 72%, 51%)'];

const monthlyData = [
  { month: 'Oct', complaints: 8, resolved: 6 },
  { month: 'Nov', complaints: 12, resolved: 10 },
  { month: 'Dec', complaints: 6, resolved: 5 },
  { month: 'Jan', complaints: 15, resolved: 11 },
  { month: 'Feb', complaints: 10, resolved: 9 },
  { month: 'Mar', complaints: 5, resolved: 2 },
];

export default function ManagementDashboard() {
  const complaints = getComplaints();

  const statusCounts = {
    Pending: complaints.filter(c => c.status === 'Pending').length,
    Booked: complaints.filter(c => c.status === 'Booked').length,
    'In-Progress': complaints.filter(c => c.status === 'In-Progress').length,
    Replaced: complaints.filter(c => c.status === 'Replaced').length,
    Rejected: complaints.filter(c => c.status === 'Rejected').length,
  };

  const pieData = Object.entries(statusCounts).map(([name, value]) => ({ name, value }));
  const warrantyExpired = complaints.filter(c => !c.warrantyValid).length;

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-2xl font-bold mb-1">Dashboard</h1>
        <p className="text-sm text-muted-foreground mb-6">RCMS Overview & Analytics</p>

        <div className="grid grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-4 mb-8">
          <StatCard label="Total" value={complaints.length} icon={ClipboardList} />
          <StatCard label="Pending" value={statusCounts.Pending} icon={Clock} colorClass="text-warning" />
          <StatCard label="Booked" value={statusCounts.Booked} icon={CheckCircle} colorClass="text-info" />
          <StatCard label="In Progress" value={statusCounts['In-Progress']} icon={Truck} colorClass="text-primary" />
          <StatCard label="Replaced" value={statusCounts.Replaced} icon={CheckCircle} colorClass="text-success" />
          <StatCard label="Rejected" value={statusCounts.Rejected} icon={XCircle} colorClass="text-destructive" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
            className="glass-card rounded-xl p-5">
            <h3 className="font-display font-semibold text-sm mb-4">Status Distribution</h3>
            <ResponsiveContainer width="100%" height={250}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={90} paddingAngle={4} dataKey="value">
                  {pieData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: 'hsl(216, 45%, 16%)', border: '1px solid hsl(216, 30%, 25%)', borderRadius: '8px', color: 'hsl(210, 40%, 96%)' }} />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
            className="glass-card rounded-xl p-5">
            <h3 className="font-display font-semibold text-sm mb-4">Monthly Trends</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(216, 30%, 25%)" />
                <XAxis dataKey="month" tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} />
                <YAxis tick={{ fill: 'hsl(215, 20%, 55%)', fontSize: 12 }} />
                <Tooltip contentStyle={{ background: 'hsl(216, 45%, 16%)', border: '1px solid hsl(216, 30%, 25%)', borderRadius: '8px', color: 'hsl(210, 40%, 96%)' }} />
                <Bar dataKey="complaints" fill="hsl(200, 72%, 47%)" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="hsl(142, 71%, 45%)" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </motion.div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-display font-semibold text-sm mb-3">Warranty Analysis</h3>
            <div className="flex items-center gap-4">
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Active Warranty</span>
                  <span className="text-success font-medium">{complaints.length - warrantyExpired}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-success rounded-full" style={{ width: `${((complaints.length - warrantyExpired) / complaints.length) * 100}%` }} />
                </div>
              </div>
              <div className="flex-1">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">Expired</span>
                  <span className="text-destructive font-medium">{warrantyExpired}</span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div className="h-full bg-destructive rounded-full" style={{ width: `${(warrantyExpired / complaints.length) * 100}%` }} />
                </div>
              </div>
            </div>
          </div>
          <div className="glass-card rounded-xl p-5">
            <h3 className="font-display font-semibold text-sm mb-3">SLA Performance</h3>
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-warning" />
              <div>
                <p className="text-2xl font-display font-bold text-foreground">87%</p>
                <p className="text-xs text-muted-foreground">Cases resolved within SLA</p>
              </div>
            </div>
          </div>
        </div>
      </motion.div>
    </AppLayout>
  );
}
