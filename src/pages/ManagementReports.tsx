import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { Complaint } from '@/lib/mock-data';
import { getComplaints } from '@/lib/complaints-store';
import { motion } from 'framer-motion';
import { Download, Filter } from 'lucide-react';
import { toast } from 'sonner';

export default function ManagementReports() {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');

  const filtered = getComplaints().filter(c => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    if (dateFrom && c.createdAt < dateFrom) return false;
    if (dateTo && c.createdAt > dateTo) return false;
    return true;
  });

  const exportCSV = () => {
    const headers = ['Ticket No,Customer,Phone,Serial No,Device,Status,Warranty,Created'];
    const rows = filtered.map(c =>
      `${c.ticketNo},${c.customerName},${c.customerPhone},${c.serialNo},${c.deviceModel},${c.status},${c.warrantyValid ? 'Active' : 'Expired'},${c.createdAt}`
    );
    const csv = [...headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'rcms-report.csv'; a.click();
    URL.revokeObjectURL(url);
    toast.success('CSV exported successfully');
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="font-display text-2xl font-bold mb-1">Reports</h1>
            <p className="text-sm text-muted-foreground">Filter and export complaint data</p>
          </div>
          <button onClick={exportCSV}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:opacity-90">
            <Download className="h-4 w-4" /> Export CSV
          </button>
        </div>

        {/* Filters */}
        <div className="glass-card rounded-xl p-4 mb-6 flex flex-wrap items-end gap-4">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wide">Status</label>
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}
              className="mt-1 block px-3 py-2 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all">
              {['All', 'Pending', 'Booked', 'In-Progress', 'Replaced', 'Rejected'].map(s => <option key={s}>{s}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wide">From</label>
            <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)}
              className="mt-1 block px-3 py-2 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
          </div>
          <div>
            <label className="text-[10px] text-muted-foreground uppercase tracking-wide">To</label>
            <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)}
              className="mt-1 block px-3 py-2 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
          </div>
          <p className="text-xs text-muted-foreground">{filtered.length} results</p>
        </div>

        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                {['Ticket #', 'Customer', 'Phone', 'Serial', 'Device', 'Status', 'Warranty', 'Date'].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => (
                <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                  className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                  <td className="px-4 py-3 font-mono text-xs text-primary">{c.ticketNo}</td>
                  <td className="px-4 py-3 text-foreground">{c.customerName}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{c.customerPhone}</td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.serialNo}</td>
                  <td className="px-4 py-3 text-muted-foreground text-xs">{c.deviceModel}</td>
                  <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                  <td className="px-4 py-3 text-xs">{c.warrantyValid ? <span className="text-success">Active</span> : <span className="text-destructive">Expired</span>}</td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{c.createdAt}</td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </motion.div>
    </AppLayout>
  );
}
