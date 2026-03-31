import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { useAuth } from '@/lib/auth-context';
import { getComplaintsByAgent } from '@/lib/complaints-store';
import { motion } from 'framer-motion';
import { Search, Eye } from 'lucide-react';
import { Complaint } from '@/lib/mock-data';

export default function AgentTickets() {
  const { user } = useAuth();
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Complaint | null>(null);

  const complaints = user ? getComplaintsByAgent(user.id) : [];
  const filtered = complaints.filter(c =>
    c.ticketNo.toLowerCase().includes(search.toLowerCase()) ||
    c.customerName.toLowerCase().includes(search.toLowerCase()) ||
    c.serialNo.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-2xl font-bold mb-1">My Tickets</h1>
        <p className="text-sm text-muted-foreground mb-6">Track your submitted replacement requests</p>

        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search tickets..."
            className="w-full pl-9 pr-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
        </div>

        {filtered.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <p className="text-muted-foreground text-sm">No tickets found. Submit a new complaint to get started.</p>
          </div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  {['Ticket #', 'Customer', 'Serial No', 'Device', 'Status', 'Date', ''].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((c, i) => (
                  <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-primary">{c.ticketNo}</td>
                    <td className="px-4 py-3 text-foreground">{c.customerName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.serialNo}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{c.deviceModel}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.createdAt}</td>
                    <td className="px-4 py-3">
                      <button onClick={() => setSelected(c)} className="text-primary hover:text-primary/80">
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
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setSelected(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-6 max-w-lg w-full mx-4" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-display font-bold text-lg">{selected.ticketNo}</h2>
                <StatusBadge status={selected.status} />
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                {[
                  ['Customer', selected.customerName],
                  ['Phone', selected.customerPhone],
                  ['Serial', selected.serialNo],
                  ['Model', selected.deviceModel],
                  ['Purchase Date', selected.purchaseDate],
                  ['Warranty', selected.warrantyValid ? 'Active' : 'Expired'],
                ].map(([label, val]) => (
                  <div key={label}>
                    <p className="text-xs text-muted-foreground">{label}</p>
                    <p className="text-foreground font-medium">{val}</p>
                  </div>
                ))}
              </div>
              <div className="mt-4">
                <p className="text-xs text-muted-foreground">Issue Description</p>
                <p className="text-sm text-foreground mt-1">{selected.issueDescription}</p>
              </div>
              <button onClick={() => setSelected(null)} className="mt-5 w-full py-2 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
                Close
              </button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
