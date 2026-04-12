import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { analyticsApi } from '@/services/apiService';
import { motion } from 'framer-motion';
import { Download, Filter, Loader } from 'lucide-react';
import { toast } from 'sonner';

export default function ManagementReports() {
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [reports, setReports] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchReports = async () => {
      setLoading(true);
      try {
        const filters: any = {};
        if (statusFilter !== 'All') filters.status = statusFilter;
        if (dateFrom) filters.dateFrom = dateFrom;
        if (dateTo) filters.dateTo = dateTo;
        
        const result = await analyticsApi.getReports(filters);
        if (result.success) {
          setReports(result.data || []);
        }
      } catch (error) {
        console.error('Failed to fetch reports:', error);
        toast.error('Failed to load reports');
      } finally {
        setLoading(false);
      }
    };

    fetchReports();
  }, [statusFilter, dateFrom, dateTo]);

  const exportCSV = () => {
    if (reports.length === 0) {
      toast.error('No data to export');
      return;
    }
    
    const headers = ['Ticket No,Customer,Phone,Serial No,Device,Status,Warranty,Created'];
    const rows = reports.map(c =>
      `${c.ticket_no},${c.customer_name},${c.customer_phone},${c.serial_no},${c.device_model},${c.status},${c.warranty_valid ? 'Active' : 'Expired'},${c.created_at}`
    );
    const csv = [...headers, ...rows].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'rcms-report.csv';
    a.click();
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
          <p className="text-xs text-muted-foreground">
            {loading ? <span className="flex items-center gap-1"><Loader className="h-3 w-3 animate-spin" /> Loading...</span> : `${reports.length} results`}
          </p>
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
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center gap-2">
                      <Loader className="h-4 w-4 animate-spin" />
                      <span className="text-muted-foreground">Loading...</span>
                    </div>
                  </td>
                </tr>
              ) : reports.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-8 text-muted-foreground">No reports found</td>
                </tr>
              ) : (
                reports.map((c, i) => (
                  <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.03 }}
                    className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-primary">{c.ticket_no}</td>
                    <td className="px-4 py-3 text-foreground">{c.customer_name}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{c.customer_phone}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.serial_no}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{c.device_model}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-xs">{c.warranty_valid ? <span className="text-success">Active</span> : <span className="text-destructive">Expired</span>}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.created_at}</td>
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </motion.div>
    </AppLayout>
  );
}
