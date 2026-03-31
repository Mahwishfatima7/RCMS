import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { getComplaints, getManufacturerUpdate } from '@/lib/complaints-store';
import { motion } from 'framer-motion';
import { Search, BookOpen } from 'lucide-react';

export default function AdminBookings() {
  const [search, setSearch] = useState('');
  const complaints = getComplaints();

  // Only show complaints that have manufacturer bookings
  const booked = complaints
    .map(c => ({ complaint: c, booking: getManufacturerUpdate(c.id) }))
    .filter(item => item.booking);

  const filtered = booked.filter(({ complaint: c, booking: b }) =>
    c.ticketNo.toLowerCase().includes(search.toLowerCase()) ||
    c.customerName.toLowerCase().includes(search.toLowerCase()) ||
    (b?.bookingId || '').toLowerCase().includes(search.toLowerCase())
  );

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-2xl font-bold mb-1">Manufacturer Bookings</h1>
        <p className="text-sm text-muted-foreground mb-6">Track all manufacturer booking details and statuses</p>

        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search bookings..."
            className="w-full pl-9 pr-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
        </div>

        {filtered.length === 0 ? (
          <div className="glass-card rounded-xl p-8 text-center">
            <BookOpen className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-muted-foreground text-sm">No manufacturer bookings yet. Use the booking form on the Complaints page to add one.</p>
          </div>
        ) : (
          <div className="glass-card rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/50">
                  {['Ticket #', 'Customer', 'Booking ID', 'Booked Date', 'Mfg Status', 'Reference', 'Ticket Status', 'Notes'].map(h => (
                    <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(({ complaint: c, booking: b }, i) => (
                  <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-primary">{c.ticketNo}</td>
                    <td className="px-4 py-3 text-foreground">{c.customerName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-success">{b?.bookingId}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{b?.bookedDate}</td>
                    <td className="px-4 py-3 text-xs text-foreground">{b?.manufacturerStatus}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{b?.referenceNo}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-xs text-muted-foreground max-w-[200px] truncate">{b?.notes}</td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
