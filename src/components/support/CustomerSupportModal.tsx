import React, { useState } from 'react';
import { X, HelpCircle, Phone, Mail, ShieldAlert, MessageSquare, CheckCircle } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';

interface CustomerSupportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CustomerSupportModal: React.FC<CustomerSupportModalProps> = ({ isOpen, onClose }) => {
  const { settings, customer } = useMarketplace();
  const [ticketSubject, setTicketSubject] = useState('');
  const [ticketMessage, setTicketMessage] = useState('');
  const [ticketSubmitted, setTicketSubmitted] = useState(false);

  if (!isOpen) return null;

  const handleSubmitTicket = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ticketSubject || !ticketMessage) return;
    setTicketSubmitted(true);
    setTimeout(() => {
      setTicketSubmitted(false);
      setTicketSubject('');
      setTicketMessage('');
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-2xl my-6 shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[88vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2">
            <HelpCircle className="w-5 h-5 text-cyan-400" />
            <h2 className="font-display font-bold text-base text-white">
              Customer Grievance & Support Center
            </h2>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="overflow-y-auto p-6 space-y-6 flex-1 text-xs">
          {/* Statutory India E-Commerce Compliance Notice */}
          <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
            <span className="font-bold text-white flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-emerald-400" />
              <span>Consumer Protection (E-Commerce) Rules 2020 Compliance</span>
            </span>
            <p className="text-slate-400 leading-relaxed">
              ALPHA X operates as a regulated electronic marketplace. In accordance with the Consumer
              Protection Rules and DPDP Act 2025, our Grievance Redressal Officer acknowledges all
              tickets within 48 hours and provides definitive resolution within 1 month.
            </p>
            <div className="pt-2 border-t border-slate-800/80 flex flex-wrap gap-4 text-slate-300 font-mono text-[11px]">
              <span>Grievance Officer: Vikramaditya S.</span>
              <span>Email: grievance@alphax.in</span>
              <span>Toll Free: {settings.supportPhone}</span>
            </div>
          </div>

          {/* Quick Contact Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <Phone className="w-4 h-4 text-cyan-400 mb-1" />
              <span className="font-semibold text-white block">24x7 Customer Helpline</span>
              <p className="text-slate-400">{settings.supportPhone}</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-1">
              <Mail className="w-4 h-4 text-indigo-400 mb-1" />
              <span className="font-semibold text-white block">Email Inquiries</span>
              <p className="text-slate-400">{settings.supportEmail}</p>
            </div>
          </div>

          {/* Raise Support Ticket */}
          <form onSubmit={handleSubmitTicket} className="space-y-3 pt-2 border-t border-slate-800">
            <h4 className="font-semibold text-white flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-indigo-400" />
              <span>Raise an In-App Complaint or Inquiry</span>
            </h4>

            <div>
              <label className="text-slate-400 block mb-1">Issue Category</label>
              <select
                value={ticketSubject}
                onChange={(e) => setTicketSubject(e.target.value)}
                required
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              >
                <option value="">Select issue category...</option>
                <option value="Delivery Delay or Courier Issue">
                  Delivery Delay or Courier Issue
                </option>
                <option value="Refund Not Credited">Refund Not Credited</option>
                <option value="Damaged / Wrong Item Received">
                  Damaged / Wrong Item Received
                </option>
                <option value="Seller Grievance">Seller Grievance</option>
              </select>
            </div>

            <div>
              <label className="text-slate-400 block mb-1">Detailed Description</label>
              <textarea
                rows={3}
                required
                value={ticketMessage}
                onChange={(e) => setTicketMessage(e.target.value)}
                placeholder="Include order ID or product details..."
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white"
              />
            </div>

            {ticketSubmitted && (
              <div className="p-3 rounded-xl bg-emerald-950/60 border border-emerald-800 text-emerald-400 font-semibold flex items-center gap-2">
                <CheckCircle className="w-4 h-4" />
                <span>Ticket registered! Reference AX-SUP-{Math.floor(10000 + Math.random() * 90000)}. An agent is assigned.</span>
              </div>
            )}

            <button
              type="submit"
              disabled={ticketSubmitted}
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold transition"
            >
              Submit Grievance Ticket
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
