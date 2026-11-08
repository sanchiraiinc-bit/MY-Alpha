import React, { useState } from 'react';
import {
  X,
  Package,
  CheckCircle,
  Truck,
  RotateCcw,
  Ban,
  FileText,
  Clock,
  ArrowRight,
  ShoppingBag,
} from 'lucide-react';
import { Order } from '../../types/marketplace';
import { useMarketplace } from '../../context/MarketplaceContext';
import {
  canCancelOrder,
  canReturnOrder,
  generateTrackingTimeline,
} from '../../utils/marketplace-logic';

interface OrderTrackingModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedOrder?: Order | null;
}

export const OrderTrackingModal: React.FC<OrderTrackingModalProps> = ({
  isOpen,
  onClose,
  selectedOrder,
}) => {
  const { orders, cancelOrder, requestReturn, addToCart } = useMarketplace();
  const [activeOrderId, setActiveOrderId] = useState<string>(
    selectedOrder ? selectedOrder.id : orders[0]?.id || ''
  );
  const [cancelReason, setCancelReason] = useState('');
  const [showCancelPrompt, setShowCancelPrompt] = useState(false);
  const [returnReason, setReturnReason] = useState('');
  const [showReturnPrompt, setShowReturnPrompt] = useState(false);
  const [invoiceDownloaded, setInvoiceDownloaded] = useState(false);

  if (!isOpen) return null;

  const currentOrder = orders.find((o) => o.id === activeOrderId) || orders[0];

  const handleCancel = () => {
    if (!currentOrder || !cancelReason) return;
    cancelOrder(currentOrder.id, cancelReason);
    setShowCancelPrompt(false);
    setCancelReason('');
  };

  const handleReturn = () => {
    if (!currentOrder || !returnReason) return;
    requestReturn(currentOrder.id, returnReason);
    setShowReturnPrompt(false);
    setReturnReason('');
  };

  const handleDownloadInvoice = () => {
    setInvoiceDownloaded(true);
    setTimeout(() => setInvoiceDownloaded(false), 2500);
  };

  const timeline = currentOrder
    ? generateTrackingTimeline(
        currentOrder.orderStatus,
        new Date(currentOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        currentOrder.deliveredAt
      )
    : [];

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-4xl my-6 shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2">
            <Package className="w-5 h-5 text-indigo-400" />
            <h2 className="font-display font-bold text-base text-white">
              My Orders & Live Telemetry
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
          {orders.length === 0 ? (
            <div className="text-center py-12 space-y-3">
              <ShoppingBag className="w-12 h-12 text-slate-600 mx-auto" />
              <p className="text-sm font-semibold text-slate-300">No orders placed yet</p>
              <p className="text-xs text-slate-500">
                Any orders you complete will appear with real-time delivery telemetry here.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
              {/* Left Column: Order Selector List */}
              <div className="md:col-span-4 space-y-2.5">
                <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Order History ({orders.length})
                </h4>

                {orders.map((ord) => (
                  <div
                    key={ord.id}
                    onClick={() => {
                      setActiveOrderId(ord.id);
                      setShowCancelPrompt(false);
                      setShowReturnPrompt(false);
                    }}
                    className={`p-3.5 rounded-2xl border cursor-pointer transition text-xs flex flex-col gap-1.5 ${
                      ord.id === activeOrderId
                        ? 'border-indigo-500 bg-indigo-950/30'
                        : 'border-slate-800 bg-slate-950/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono font-bold text-white">{ord.id}</span>
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                          ord.orderStatus === 'delivered'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : ord.orderStatus === 'cancelled'
                            ? 'bg-rose-950 text-rose-400 border border-rose-800'
                            : 'bg-cyan-950 text-cyan-300 border border-cyan-800'
                        }`}
                      >
                        {ord.orderStatus.replace(/_/g, ' ')}
                      </span>
                    </div>

                    <p className="text-slate-400 truncate">
                      {ord.items[0]?.productTitle}
                      {ord.items.length > 1 ? ` +${ord.items.length - 1} more` : ''}
                    </p>

                    <div className="flex items-center justify-between pt-1 border-t border-slate-800/80 text-[11px]">
                      <span className="text-slate-500">
                        {new Date(ord.createdAt).toLocaleDateString('en-IN', {
                          day: 'numeric',
                          month: 'short',
                        })}
                      </span>
                      <span className="font-bold text-white">
                        ₹{ord.totalAmount.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Right Column: Order Details & 7-Stage Timeline */}
              {currentOrder && (
                <div className="md:col-span-8 space-y-6 bg-slate-950/70 border border-slate-800 p-6 rounded-3xl">
                  {/* Top Bar Info */}
                  <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-display font-bold text-base text-white">
                          Order #{currentOrder.id}
                        </h3>
                        <span className="text-xs text-slate-400">
                          via {currentOrder.paymentMethod}
                        </span>
                      </div>
                      <p className="text-xs text-cyan-400 font-mono mt-0.5">
                        Tracking: {currentOrder.trackingNumber} ({currentOrder.courierName})
                      </p>
                    </div>

                    <button
                      onClick={handleDownloadInvoice}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition"
                    >
                      <FileText className="w-3.5 h-3.5 text-indigo-400" />
                      <span>{invoiceDownloaded ? 'GST Invoice Ready ✓' : 'Tax Invoice'}</span>
                    </button>
                  </div>

                  {/* 7-Stage Live Tracking Progress */}
                  <div>
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Truck className="w-4 h-4 text-cyan-400" />
                      <span>7-Stage Delivery Telemetry</span>
                    </h4>

                    <div className="relative pl-6 space-y-4 before:absolute before:left-2.5 before:top-2 before:bottom-2 before:w-0.5 before:bg-slate-800">
                      {timeline.map((step, idx) => (
                        <div key={idx} className="relative flex items-start gap-3 text-xs">
                          <div
                            className={`absolute -left-6 w-5 h-5 rounded-full flex items-center justify-center ${
                              step.current
                                ? 'bg-cyan-500 text-slate-950 ring-4 ring-cyan-500/20'
                                : step.done
                                ? 'bg-emerald-500 text-slate-950'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            <CheckCircle className="w-3 h-3" />
                          </div>

                          <div className="flex-1">
                            <span
                              className={`font-semibold ${
                                step.current
                                  ? 'text-cyan-300'
                                  : step.done
                                  ? 'text-slate-100'
                                  : 'text-slate-500'
                              }`}
                            >
                              {step.label}
                            </span>
                            {step.timestamp && (
                              <span className="text-[10px] text-slate-500 ml-2">
                                {step.timestamp}
                              </span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Order Items List */}
                  <div className="pt-4 border-t border-slate-800 space-y-3">
                    <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                      Items in this package
                    </h4>

                    {currentOrder.items.map((item, idx) => (
                      <div
                        key={idx}
                        className="p-3 rounded-2xl bg-slate-900 border border-slate-800/80 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={item.productImage}
                            alt=""
                            className="w-12 h-12 rounded-xl object-contain bg-slate-950 p-1"
                          />
                          <div>
                            <p className="font-semibold text-white">{item.productTitle}</p>
                            <p className="text-[11px] text-slate-400">
                              Seller: {item.sellerName} • Qty: {item.quantity}
                            </p>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="font-bold text-white">
                            ₹{(item.priceAtOrder * item.quantity).toLocaleString('en-IN')}
                          </span>
                          <button
                            onClick={() => addToCart(item.productId, 1)}
                            className="block text-[10px] text-indigo-400 hover:underline mt-1"
                          >
                            Buy Again
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Delivery Address & Bill */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-800 text-xs">
                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800">
                      <span className="text-slate-400 block mb-1">Shipping Address</span>
                      <p className="font-semibold text-white">
                        {currentOrder.shippingAddress.fullName}
                      </p>
                      <p className="text-slate-400">{currentOrder.shippingAddress.line1}</p>
                      <p className="text-slate-300">
                        {currentOrder.shippingAddress.city},{' '}
                        {currentOrder.shippingAddress.pincode}
                      </p>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-900 border border-slate-800 space-y-1">
                      <span className="text-slate-400 block mb-1">Payment Snapshot</span>
                      <div className="flex justify-between text-slate-400">
                        <span>Items Subtotal:</span>
                        <span>₹{currentOrder.subtotal.toLocaleString('en-IN')}</span>
                      </div>
                      {currentOrder.discountAmount > 0 && (
                        <div className="flex justify-between text-emerald-400">
                          <span>Discount:</span>
                          <span>-₹{currentOrder.discountAmount.toLocaleString('en-IN')}</span>
                        </div>
                      )}
                      <div className="flex justify-between text-white font-bold pt-1 border-t border-slate-800">
                        <span>Total Paid:</span>
                        <span className="text-cyan-400">
                          ₹{currentOrder.totalAmount.toLocaleString('en-IN')}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Order Actions: Cancel or Return */}
                  <div className="pt-4 border-t border-slate-800 flex flex-wrap items-center justify-between gap-3">
                    {/* Cancellation flow */}
                    {canCancelOrder(currentOrder.orderStatus) && (
                      <div>
                        {showCancelPrompt ? (
                          <div className="flex items-center gap-2 text-xs">
                            <select
                              value={cancelReason}
                              onChange={(e) => setCancelReason(e.target.value)}
                              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                            >
                              <option value="">Select cancellation reason...</option>
                              <option value="Ordered by mistake">Ordered by mistake</option>
                              <option value="Found lower price elsewhere">
                                Found lower price elsewhere
                              </option>
                              <option value="Delivery time too long">
                                Delivery time too long
                              </option>
                            </select>
                            <button
                              onClick={handleCancel}
                              disabled={!cancelReason}
                              className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white font-bold rounded-lg disabled:opacity-50"
                            >
                              Confirm Cancel
                            </button>
                            <button
                              onClick={() => setShowCancelPrompt(false)}
                              className="text-slate-400 hover:text-white"
                            >
                              Dismiss
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowCancelPrompt(true)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-rose-950/60 border border-slate-800 hover:border-rose-800 text-rose-400 text-xs font-semibold flex items-center gap-1.5 transition"
                          >
                            <Ban className="w-3.5 h-3.5" />
                            <span>Cancel Order</span>
                          </button>
                        )}
                      </div>
                    )}

                    {/* Return flow */}
                    {canReturnOrder(currentOrder.orderStatus) && (
                      <div>
                        {showReturnPrompt ? (
                          <div className="flex items-center gap-2 text-xs">
                            <select
                              value={returnReason}
                              onChange={(e) => setReturnReason(e.target.value)}
                              className="bg-slate-900 border border-slate-700 rounded-lg px-2.5 py-1.5 text-slate-200"
                            >
                              <option value="">Select return reason...</option>
                              <option value="Performance issue or defective">
                                Performance issue or defective
                              </option>
                              <option value="Item not as described">Item not as described</option>
                              <option value="Damaged outer box">Damaged outer box</option>
                            </select>
                            <button
                              onClick={handleReturn}
                              disabled={!returnReason}
                              className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white font-bold rounded-lg disabled:opacity-50"
                            >
                              Request Return
                            </button>
                            <button
                              onClick={() => setShowReturnPrompt(false)}
                              className="text-slate-400 hover:text-white"
                            >
                              Dismiss
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => setShowReturnPrompt(true)}
                            className="px-3 py-1.5 rounded-xl bg-slate-900 hover:bg-amber-950/60 border border-slate-800 hover:border-amber-800 text-amber-400 text-xs font-semibold flex items-center gap-1.5 transition"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            <span>Request 7-Day Return / Replacement</span>
                          </button>
                        )}
                      </div>
                    )}

                    {currentOrder.refundStatus && currentOrder.refundStatus !== 'none' && (
                      <div className="flex items-center gap-2 text-xs text-emerald-400">
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>
                          Refund Status:{' '}
                          <span className="font-bold uppercase font-mono">
                            {currentOrder.refundStatus}
                          </span>{' '}
                          (₹{currentOrder.totalAmount.toLocaleString('en-IN')})
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
