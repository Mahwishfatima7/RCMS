import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { useAuth } from '@/lib/auth-context';
import { addComplaint, validateSerial } from '@/lib/complaints-store';
import { mockSerials } from '@/lib/mock-data';
import { motion } from 'framer-motion';
import { CheckCircle, AlertTriangle, XCircle, Send } from 'lucide-react';
import { toast } from 'sonner';

export default function AgentNewComplaint() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [serialNo, setSerialNo] = useState('');
  const [serialStatus, setSerialStatus] = useState<'valid' | 'expired' | 'not-found' | null>(null);
  const [serialEntry, setSerialEntry] = useState<typeof mockSerials[0] | null>(null);
  const [form, setForm] = useState({
    customerName: '', customerPhone: '', customerEmail: '', customerAddress: '',
    issueDescription: '',
  });

  const handleSerialChange = (val: string) => {
    setSerialNo(val);
    if (val.length < 5) { setSerialStatus(null); setSerialEntry(null); return; }
    const result = validateSerial(val);
    setSerialStatus(result.status);
    setSerialEntry(result.entry);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !serialEntry) return;
    if (!form.customerName || !form.customerPhone || !form.issueDescription) {
      toast.error('Please fill in all required fields');
      return;
    }

    const complaint = addComplaint({
      agentId: user.id,
      agentName: user.name,
      customerName: form.customerName,
      customerPhone: form.customerPhone,
      customerEmail: form.customerEmail,
      customerAddress: form.customerAddress,
      serialNo: serialEntry.serialNo,
      deviceModel: serialEntry.model,
      issueDescription: form.issueDescription,
      purchaseDate: serialEntry.purchaseDate,
      warrantyExpiry: serialEntry.warrantyExpiry,
      warrantyValid: serialStatus === 'valid',
    });

    toast.success(`Ticket ${complaint.ticketNo} created successfully!`);
    setTimeout(() => navigate('/agent/tickets'), 1500);
  };

  return (
    <AppLayout>
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="font-display text-2xl font-bold mb-1">New Replacement Request</h1>
        <p className="text-sm text-muted-foreground mb-6">Submit a camera replacement complaint for a customer</p>

        <form onSubmit={handleSubmit} className="max-w-3xl space-y-6">
          {/* Serial Validation */}
          <div className="glass-card rounded-xl p-5 space-y-4">
            <h2 className="font-display font-semibold text-sm text-foreground">Device Verification</h2>
            <p className="text-xs text-muted-foreground">Enter the camera serial number to verify it was supplied by DXB Technologies and check warranty status.</p>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Camera Serial Number *</label>
              <div className="relative mt-1">
                <input type="text" value={serialNo} onChange={e => handleSerialChange(e.target.value)}
                  placeholder="e.g. CAM-2024-001"
                  className="w-full px-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                {serialStatus === 'valid' && <CheckCircle className="absolute right-3 top-3 h-4 w-4 text-success" />}
                {serialStatus === 'expired' && <AlertTriangle className="absolute right-3 top-3 h-4 w-4 text-warning" />}
                {serialStatus === 'not-found' && <XCircle className="absolute right-3 top-3 h-4 w-4 text-destructive" />}
              </div>
              {serialStatus === 'not-found' && <p className="text-xs text-destructive mt-1">Serial number not found — this camera is not in DXB's records</p>}
              {serialStatus === 'expired' && <p className="text-xs text-warning mt-1">⚠ Warranty expired — complaint will be flagged for review</p>}
              {serialStatus === 'valid' && <p className="text-xs text-success mt-1">✓ Device verified as DXB-supplied, warranty active</p>}
            </div>

            {serialEntry && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }}
                className="grid grid-cols-3 gap-3 p-3 bg-secondary/30 rounded-lg">
                <div><p className="text-[10px] text-muted-foreground">Model</p><p className="text-xs font-medium text-foreground">{serialEntry.model}</p></div>
                <div><p className="text-[10px] text-muted-foreground">Purchase Date</p><p className="text-xs font-medium text-foreground">{serialEntry.purchaseDate}</p></div>
                <div><p className="text-[10px] text-muted-foreground">Warranty Expiry</p><p className="text-xs font-medium text-foreground">{serialEntry.warrantyExpiry}</p></div>
              </motion.div>
            )}
          </div>

          {/* Customer Info */}
          <div className="glass-card rounded-xl p-5 space-y-4">
            <h2 className="font-display font-semibold text-sm text-foreground">Customer Information</h2>
            <div className="grid grid-cols-2 gap-4">
              {[
                { key: 'customerName', label: 'Full Name *', placeholder: 'Customer full name' },
                { key: 'customerPhone', label: 'Phone *', placeholder: '+971...' },
                { key: 'customerEmail', label: 'Email', placeholder: 'customer@email.com' },
                { key: 'customerAddress', label: 'Address', placeholder: 'Full address' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">{f.label}</label>
                  <input type="text" value={form[f.key as keyof typeof form]}
                    onChange={e => setForm(prev => ({ ...prev, [f.key]: e.target.value }))}
                    placeholder={f.placeholder}
                    className="mt-1 w-full px-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all" />
                </div>
              ))}
            </div>
          </div>

          {/* Issue */}
          <div className="glass-card rounded-xl p-5 space-y-4">
            <h2 className="font-display font-semibold text-sm text-foreground">Issue Details</h2>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Description *</label>
              <textarea value={form.issueDescription}
                onChange={e => setForm(prev => ({ ...prev, issueDescription: e.target.value }))}
                placeholder="Describe the issue in detail..."
                rows={4}
                className="mt-1 w-full px-3 py-2.5 bg-secondary/50 border border-border/50 rounded-lg text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all resize-none" />
            </div>
          </div>

          <button type="submit" disabled={serialStatus !== 'valid' && serialStatus !== 'expired'}
            className="flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-primary-foreground font-semibold text-sm transition-all hover:opacity-90 disabled:opacity-40 disabled:cursor-not-allowed">
            <Send className="h-4 w-4" />
            Submit Complaint
          </button>
        </form>
      </motion.div>
    </AppLayout>
  );
}
