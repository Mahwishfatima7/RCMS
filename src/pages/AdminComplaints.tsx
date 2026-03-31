import { useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { StatusBadge } from '@/components/StatusBadge';
import { getComplaints, getManufacturerUpdate, addManufacturerUpdate, updateComplaintStatus } from '@/lib/complaints-store';
import { Complaint } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { Search, Eye, BookOpen, Save } from 'lucide-react';
import { toast } from 'sonner';

export default function AdminComplaints() {
  const [search, setSearch] = useState('');
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [showBooking, setShowBooking] = useState(false);
  const [bookingForm, setBookingForm] = useState({
    bookingId: '', bookedDate: '', manufacturerStatus: '', referenceNo: '', notes: '',
  });
  const [statusUpdate, setStatusUpdate] = useState<Complaint['status']>('Pending');
  const [, forceUpdate] = useState(0);

  const complaints = getComplaints();
  const filtered = complaints.filter(c =>
    c.ticketNo.toLowerCase().includes(search.toLowerCase()) ||
    c.customerName.toLowerCase().includes(search.toLowerCase()) ||
    c.serialNo.toLowerCase().includes(search.toLowerCase())
  );

  const handleSaveBooking = () => {
    if (!selectedComplaint) return;
    if (!bookingForm.bookingId) {
      toast.error('Please enter a manufacturer booking ID');
      return;
    }
    addManufacturerUpdate({
      complaintId: selectedComplaint.id,
      bookingId: bookingForm.bookingId,
      bookedDate: bookingForm.bookedDate || new Date().toISOString().split('T')[0],
      manufacturerStatus: bookingForm.manufacturerStatus,
      referenceNo: bookingForm.referenceNo,
      notes: bookingForm.notes,
    });
    updateComplaintStatus(selectedComplaint.id, statusUpdate);
    toast.success('Manufacturer booking saved & ticket status updated');
    setShowBooking(false);
    setSelectedComplaint(null);
    setBookingForm({ bookingId: '', bookedDate: '', manufacturerStatus: '', referenceNo: '', notes: '' });
    forceUpdate(n => n + 1);
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-2xl font-bold mb-1">All Complaints</h1>
        <p className="text-sm text-muted-foreground mb-6">Manage agent-submitted complaints and manufacturer bookings</p>

        <div className="relative mb-4 max-w-sm">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
          <input type="text" value={search} onChange={e => setSearch(e.target.value)}
            placeholder="Search complaints..."
            className="w-full pl-9 pr-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
        </div>

        <div className="glass-card rounded-xl overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border/50">
                {['Ticket #', 'Agent', 'Customer', 'Serial', 'Status', 'Mfg Booking', 'Date', ''].map(h => (
                  <th key={h} className="text-left px-4 py-3 text-xs font-medium text-muted-foreground uppercase tracking-wide">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.map((c, i) => {
                const mfg = getManufacturerUpdate(c.id);
                return (
                  <motion.tr key={c.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.05 }}
                    className="border-b border-border/30 hover:bg-secondary/30 transition-colors">
                    <td className="px-4 py-3 font-mono text-xs text-primary">{c.ticketNo}</td>
                    <td className="px-4 py-3 text-muted-foreground text-xs">{c.agentName}</td>
                    <td className="px-4 py-3 text-foreground">{c.customerName}</td>
                    <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.serialNo}</td>
                    <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                    <td className="px-4 py-3 text-xs">{mfg ? <span className="text-success">{mfg.bookingId}</span> : <span className="text-muted-foreground">—</span>}</td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">{c.createdAt}</td>
                    <td className="px-4 py-3 flex gap-1">
                      <button onClick={() => { setSelectedComplaint(c); setShowBooking(false); }} className="text-primary hover:text-primary/80"><Eye className="h-4 w-4" /></button>
                      <button onClick={() => { setSelectedComplaint(c); setShowBooking(true); setStatusUpdate(c.status); }} className="text-warning hover:text-warning/80"><BookOpen className="h-4 w-4" /></button>
                    </td>
                  </motion.tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm" onClick={() => setSelectedComplaint(null)}>
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="glass-card rounded-2xl p-6 max-w-2xl w-full mx-4 max-h-[80vh] overflow-auto" onClick={e => e.stopPropagation()}>

              {!showBooking ? (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="font-display font-bold text-lg">{selectedComplaint.ticketNo}</h2>
                    <StatusBadge status={selectedComplaint.status} />
                  </div>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    {[
                      ['Agent', selectedComplaint.agentName], ['Customer', selectedComplaint.customerName],
                      ['Phone', selectedComplaint.customerPhone], ['Email', selectedComplaint.customerEmail],
                      ['Address', selectedComplaint.customerAddress], ['Serial', selectedComplaint.serialNo],
                      ['Model', selectedComplaint.deviceModel], ['Purchase Date', selectedComplaint.purchaseDate],
                      ['Warranty Expiry', selectedComplaint.warrantyExpiry],
                      ['Warranty', selectedComplaint.warrantyValid ? '✓ Active' : '✗ Expired'],
                    ].map(([l, v]) => (
                      <div key={l}><p className="text-xs text-muted-foreground">{l}</p><p className="text-foreground font-medium">{v}</p></div>
                    ))}
                  </div>
                  <div className="mt-4">
                    <p className="text-xs text-muted-foreground">Issue Description</p>
                    <p className="text-sm text-foreground mt-1">{selectedComplaint.issueDescription}</p>
                  </div>
                  {getManufacturerUpdate(selectedComplaint.id) && (
                    <div className="mt-4 p-3 bg-secondary/30 rounded-lg">
                      <p className="text-xs font-medium text-primary mb-2">Manufacturer Booking</p>
                      {(() => { const m = getManufacturerUpdate(selectedComplaint.id)!; return (
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div><p className="text-[10px] text-muted-foreground">Booking ID</p><p className="text-foreground">{m.bookingId}</p></div>
                          <div><p className="text-[10px] text-muted-foreground">Status</p><p className="text-foreground">{m.manufacturerStatus}</p></div>
                          <div><p className="text-[10px] text-muted-foreground">Reference</p><p className="text-foreground">{m.referenceNo}</p></div>
                          <div><p className="text-[10px] text-muted-foreground">Notes</p><p className="text-foreground">{m.notes}</p></div>
                        </div>
                      ); })()}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <h2 className="font-display font-bold text-lg mb-4">Manufacturer Booking — {selectedComplaint.ticketNo}</h2>
                  <div className="space-y-4">
                    {[
                      { key: 'bookingId', label: 'Manufacturer Booking ID *', placeholder: 'e.g. MFG-HIK-12345' },
                      { key: 'bookedDate', label: 'Booking Date', placeholder: 'YYYY-MM-DD', type: 'date' },
                      { key: 'manufacturerStatus', label: 'Manufacturer Status', placeholder: 'e.g. Under Review' },
                      { key: 'referenceNo', label: 'Reference Number', placeholder: 'e.g. REF-2026-XXXX' },
                    ].map(f => (
                      <div key={f.key}>
                        <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{f.label}</label>
                        <input type={f.type || 'text'} value={bookingForm[f.key as keyof typeof bookingForm]}
                          onChange={e => setBookingForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                          placeholder={f.placeholder}
                          className="mt-1 w-full px-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                      </div>
                    ))}
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Notes</label>
                      <textarea value={bookingForm.notes}
                        onChange={e => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Internal notes..."
                        rows={3}
                        className="mt-1 w-full px-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none" />
                    </div>
                    <div>
                      <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Update Ticket Status</label>
                      <select value={statusUpdate} onChange={e => setStatusUpdate(e.target.value as Complaint['status'])}
                        className="mt-1 w-full px-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all">
                        <option>Pending</option><option>Booked</option><option>In-Progress</option><option>Replaced</option><option>Rejected</option>
                      </select>
                    </div>
                    <button onClick={handleSaveBooking}
                      className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:opacity-90">
                      <Save className="h-4 w-4" /> Save Booking
                    </button>
                  </div>
                </>
              )}

              <button onClick={() => setSelectedComplaint(null)} className="mt-5 w-full py-2 rounded-lg bg-secondary text-foreground text-sm font-medium hover:bg-secondary/80 transition-colors">
                Close
              </button>
            </motion.div>
          </div>
        )}
      </motion.div>
    </AppLayout>
  );
}
