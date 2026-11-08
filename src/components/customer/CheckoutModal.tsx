import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import {
  X,
  MapPin,
  CreditCard,
  QrCode,
  Building,
  Banknote,
  CheckCircle2,
  ShieldCheck,
  ArrowRight,
  Plus,
  Package,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { Order, Address } from '../../types/marketplace';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  onOrderSuccess,
}) => {
  const { customer, cartTotals, placeOrder, addCustomerAddress } = useMarketplace();

  const [selectedAddressId, setSelectedAddressId] = useState<string>(
    customer.defaultAddressId || customer.addresses[0]?.id || ''
  );
  const [paymentMethod, setPaymentMethod] = useState<Order['paymentMethod']>('UPI');
  const [upiId, setUpiId] = useState('rahul.sharma@okhdfcbank');
  const [cardNumber, setCardNumber] = useState('4532 •••• •••• 8892');
  const [isProcessing, setIsProcessing] = useState(false);
  const [orderComplete, setOrderComplete] = useState<Order | null>(null);

  // New Address form state
  const [showAddAddress, setShowAddAddress] = useState(false);
  const [newFullName, setNewFullName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newLine1, setNewLine1] = useState('');
  const [newCity, setNewCity] = useState('');
  const [newState, setNewState] = useState('');
  const [newPincode, setNewPincode] = useState('');
  const [newType, setNewType] = useState<'Home' | 'Work'>('Home');

  if (!isOpen) return null;

  const handleCreateAddress = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newFullName || !newLine1 || !newCity || !newPincode) return;

    const created = addCustomerAddress({
      fullName: newFullName,
      phone: newPhone || customer.phone,
      line1: newLine1,
      city: newCity,
      state: newState || 'Karnataka',
      pincode: newPincode,
      type: newType,
      isDefault: false,
    });
    setSelectedAddressId(created.id);
    setShowAddAddress(false);
  };

  const handlePlaceOrder = async () => {
    setIsProcessing(true);

    try {
      // Simulate bank & payment gateway verification handshake
      await new Promise((resolve) => setTimeout(resolve, 900));

      const createdOrder = await placeOrder(paymentMethod, selectedAddressId);
      setOrderComplete(createdOrder);

      // Confetti burst
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#6366f1', '#06b6d4', '#10b981', '#f59e0b'],
      });
    } catch (err) {
      console.error(err);
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl my-6 shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <h2 className="font-display font-bold text-base text-white">
              {orderComplete ? 'Order Confirmation' : 'ALPHA X Express Checkout'}
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
        <div className="overflow-y-auto p-6 flex-1 space-y-6">
          {orderComplete ? (
            /* Order Placed Success View */
            <div className="py-8 text-center space-y-6 animate-in fade-in">
              <div className="w-20 h-20 rounded-full bg-emerald-950/80 border-2 border-emerald-500/80 text-emerald-400 flex items-center justify-center mx-auto shadow-xl shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">
                  Payment Verified & Confirmed
                </span>
                <h1 className="font-display font-black text-2xl md:text-3xl text-white mt-1">
                  Thank You, {customer.name}!
                </h1>
                <p className="text-xs text-slate-300 mt-1 max-w-md mx-auto">
                  Your order <span className="font-mono font-bold text-white">{orderComplete.id}</span> has
                  been dispatched to seller warehouses.
                </p>
              </div>

              {/* Order Summary Snapshot */}
              <div className="p-5 rounded-2xl bg-slate-950/80 border border-slate-800 text-left max-w-lg mx-auto space-y-3">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-400">Tracking Number:</span>
                    <p className="font-mono font-bold text-cyan-400 text-sm">
                      {orderComplete.trackingNumber}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-400">Courier:</span>
                    <p className="font-medium text-slate-200">{orderComplete.courierName}</p>
                  </div>
                </div>

                <div className="space-y-2 text-xs">
                  {orderComplete.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <img
                          src={item.productImage}
                          alt=""
                          className="w-8 h-8 rounded bg-slate-900 object-contain"
                        />
                        <span className="text-slate-200 truncate max-w-[200px]">
                          {item.productTitle} (x{item.quantity})
                        </span>
                      </div>
                      <span className="font-bold text-white">
                        ₹{(item.priceAtOrder * item.quantity).toLocaleString('en-IN')}
                      </span>
                    </div>
                  ))}
                </div>

                <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                  <span className="text-slate-400">Total Paid via {orderComplete.paymentMethod}:</span>
                  <span className="font-display font-black text-base text-cyan-400">
                    ₹{orderComplete.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              <div className="flex flex-wrap justify-center gap-3 pt-2">
                <button
                  onClick={() => {
                    onOrderSuccess(orderComplete);
                    onClose();
                  }}
                  className="px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition"
                >
                  <Package className="w-4 h-4" />
                  <span>Track Live Delivery Progress</span>
                </button>

                <button
                  onClick={onClose}
                  className="px-6 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold transition"
                >
                  Continue Shopping
                </button>
              </div>
            </div>
          ) : (
            /* Checkout Steps View */
            <>
              {/* Step 1: Delivery Address Selection */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-cyan-400" />
                    <span>1. Delivery Address</span>
                  </h3>
                  <button
                    onClick={() => setShowAddAddress(!showAddAddress)}
                    className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>{showAddAddress ? 'Cancel' : 'Add New Address'}</span>
                  </button>
                </div>

                {/* Add Address Form */}
                {showAddAddress ? (
                  <form
                    onSubmit={handleCreateAddress}
                    className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3 text-xs"
                  >
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="text-slate-400 block mb-1">Full Name</label>
                        <input
                          type="text"
                          required
                          value={newFullName}
                          onChange={(e) => setNewFullName(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">10-Digit Phone</label>
                        <input
                          type="text"
                          required
                          value={newPhone}
                          onChange={(e) => setNewPhone(e.target.value)}
                          placeholder="+91..."
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="text-slate-400 block mb-1">Flat / Building / Street</label>
                      <input
                        type="text"
                        required
                        value={newLine1}
                        onChange={(e) => setNewLine1(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                      />
                    </div>

                    <div className="grid grid-cols-3 gap-3">
                      <div>
                        <label className="text-slate-400 block mb-1">City</label>
                        <input
                          type="text"
                          required
                          value={newCity}
                          onChange={(e) => setNewCity(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">State</label>
                        <input
                          type="text"
                          required
                          value={newState}
                          onChange={(e) => setNewState(e.target.value)}
                          placeholder="Karnataka"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white"
                        />
                      </div>
                      <div>
                        <label className="text-slate-400 block mb-1">PIN Code</label>
                        <input
                          type="text"
                          required
                          value={newPincode}
                          onChange={(e) => setNewPincode(e.target.value)}
                          placeholder="560102"
                          className="w-full bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-white font-mono"
                        />
                      </div>
                    </div>

                    <button
                      type="submit"
                      className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                    >
                      Save & Deliver Here
                    </button>
                  </form>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {customer.addresses.map((addr: Address) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddressId(addr.id)}
                        className={`p-3.5 rounded-2xl border cursor-pointer transition text-xs flex flex-col justify-between ${
                          selectedAddressId === addr.id
                            ? 'border-indigo-500 bg-indigo-950/30'
                            : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                        }`}
                      >
                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="font-semibold text-white">{addr.fullName}</span>
                            <span className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-300">
                              {addr.type}
                            </span>
                          </div>
                          <p className="text-slate-400 line-clamp-2">{addr.line1}</p>
                          <p className="text-slate-300 font-medium mt-1">
                            {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                        </div>

                        <div className="mt-2 pt-2 border-t border-slate-800/80 flex items-center justify-between">
                          <span className="text-slate-500 text-[10px]">{addr.phone}</span>
                          {selectedAddressId === addr.id && (
                            <span className="text-cyan-400 font-semibold text-[10px]">Selected</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Step 2: Payment Method */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h3 className="font-display font-bold text-sm text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-cyan-400" />
                  <span>2. Secure Payment Method</span>
                </h3>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('UPI')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                      paymentMethod === 'UPI'
                        ? 'border-indigo-500 bg-indigo-950/40 text-cyan-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <QrCode className="w-5 h-5 text-indigo-400" />
                    <span>UPI / QR</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('Card')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                      paymentMethod === 'Card'
                        ? 'border-indigo-500 bg-indigo-950/40 text-cyan-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <CreditCard className="w-5 h-5 text-indigo-400" />
                    <span>Credit / Debit</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('NetBanking')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                      paymentMethod === 'NetBanking'
                        ? 'border-indigo-500 bg-indigo-950/40 text-cyan-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Building className="w-5 h-5 text-indigo-400" />
                    <span>Net Banking</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setPaymentMethod('COD')}
                    className={`p-3 rounded-xl border text-xs font-semibold flex flex-col items-center gap-1.5 transition ${
                      paymentMethod === 'COD'
                        ? 'border-indigo-500 bg-indigo-950/40 text-cyan-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:text-white'
                    }`}
                  >
                    <Banknote className="w-5 h-5 text-indigo-400" />
                    <span>Cash on Delivery</span>
                  </button>
                </div>

                {/* Sub-method details */}
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 text-xs">
                  {paymentMethod === 'UPI' && (
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-300 font-semibold">UPI ID / VPA</span>
                        <span className="text-[10px] text-emerald-400">GPay • PhonePe • Paytm</span>
                      </div>
                      <input
                        type="text"
                        value={upiId}
                        onChange={(e) => setUpiId(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
                      />
                      <p className="text-[11px] text-slate-500">
                        A payment collect request will be authenticated via your UPI app.
                      </p>
                    </div>
                  )}

                  {paymentMethod === 'Card' && (
                    <div className="space-y-2">
                      <label className="text-slate-300 font-semibold block">Card Number</label>
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={(e) => setCardNumber(e.target.value)}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-mono text-xs focus:border-indigo-500 focus:outline-none"
                      />
                      <div className="grid grid-cols-2 gap-2 pt-1">
                        <input
                          type="text"
                          placeholder="MM/YY"
                          defaultValue="08/29"
                          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs text-center"
                        />
                        <input
                          type="password"
                          placeholder="CVV"
                          defaultValue="891"
                          maxLength={3}
                          className="bg-slate-900 border border-slate-700 rounded-lg px-3 py-1.5 text-white font-mono text-xs text-center"
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'NetBanking' && (
                    <div className="space-y-1">
                      <span className="text-slate-300 font-semibold block mb-2">Select Bank</span>
                      <div className="flex flex-wrap gap-2">
                        {['HDFC Bank', 'ICICI Bank', 'State Bank of India', 'Axis Bank'].map((b) => (
                          <span
                            key={b}
                            className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs font-medium cursor-pointer hover:border-indigo-500"
                          >
                            {b}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {paymentMethod === 'COD' && (
                    <p className="text-slate-300">
                      Cash on Delivery is available. Please keep exact cash or pay the delivery executive
                      via UPI QR code upon arrival.
                    </p>
                  )}
                </div>
              </div>

              {/* Step 3: Transparent Bill Breakdown */}
              <div className="p-4 rounded-2xl bg-slate-950/70 border border-slate-800 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Cart Subtotal</span>
                  <span className="text-white font-medium">
                    ₹{cartTotals.subtotal.toLocaleString('en-IN')}
                  </span>
                </div>
                {cartTotals.discountAmount > 0 && (
                  <div className="flex justify-between text-emerald-400">
                    <span>Discount Savings</span>
                    <span>-₹{cartTotals.discountAmount.toLocaleString('en-IN')}</span>
                  </div>
                )}
                <div className="flex justify-between text-slate-400">
                  <span>Express Delivery</span>
                  <span>
                    {cartTotals.deliveryFee === 0 ? (
                      <span className="text-emerald-400 font-semibold">FREE</span>
                    ) : (
                      `₹${cartTotals.deliveryFee}`
                    )}
                  </span>
                </div>
                <div className="pt-2 border-t border-slate-800 flex justify-between font-bold text-sm text-white">
                  <span>Payable Amount</span>
                  <span className="font-display text-base text-cyan-400">
                    ₹{cartTotals.totalAmount.toLocaleString('en-IN')}
                  </span>
                </div>
              </div>

              {/* Final Confirm Button */}
              <button
                onClick={handlePlaceOrder}
                disabled={isProcessing || !selectedAddressId}
                className="w-full py-4 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-xl shadow-indigo-600/30 transition disabled:opacity-50"
              >
                {isProcessing ? (
                  <span>Securing Order Handshake...</span>
                ) : (
                  <>
                    <span>Confirm & Pay ₹{cartTotals.totalAmount.toLocaleString('en-IN')}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};
