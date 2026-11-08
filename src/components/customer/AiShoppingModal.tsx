import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Send,
  Bot,
  User,
  ShoppingCart,
  ArrowRight,
  HelpCircle,
  Lightbulb,
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { consultShoppingAssistant, AiShoppingRecommendation } from '../../services/geminiService';
import { Product } from '../../types/marketplace';

interface AiShoppingModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectProduct: (product: Product) => void;
}

interface Message {
  sender: 'user' | 'assistant';
  text: string;
  recommendation?: AiShoppingRecommendation;
}

export const AiShoppingModal: React.FC<AiShoppingModalProps> = ({
  isOpen,
  onClose,
  onSelectProduct,
}) => {
  const { products, addToCart } = useMarketplace();

  const [inputQuery, setInputQuery] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      sender: 'assistant',
      text: 'Hello! I am your ALPHA X AI Shopping Concierge. Describe what you are looking for—your budget, intended use (e.g. "Laptop for software engineering under ₹1,50,000" or "Audiophile headphones with ANC")—and I will evaluate live verified inventory to recommend the best match.',
    },
  ]);

  if (!isOpen) return null;

  const quickPrompts = [
    'Laptop for coding & engineering under ₹1,50,000',
    'Best wireless headphones with active noise cancellation',
    'Curved gaming & productivity monitor with OLED',
    'Commercial grade espresso machine for home barista',
  ];

  const handleSend = async (queryToSend?: string) => {
    const q = (queryToSend || inputQuery).trim();
    if (!q || loading) return;

    const userMsg: Message = { sender: 'user', text: q };
    setMessages((prev) => [...prev, userMsg]);
    setInputQuery('');
    setLoading(true);

    try {
      const rec = await consultShoppingAssistant(q, products);
      const assistantMsg: Message = {
        sender: 'assistant',
        text: rec.summary,
        recommendation: rec,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (e) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'assistant',
          text: 'I could not process that request right now. You can browse our verified catalog categories directly.',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-6 overflow-y-auto">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl w-full max-w-3xl my-6 shadow-2xl overflow-hidden animate-in zoom-in-95 flex flex-col h-[85vh]">
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between bg-slate-950/70">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-600/30 border border-indigo-500/40 text-cyan-300">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="font-display font-bold text-base text-white">
                ALPHA X Shopping Concierge
              </h2>
              <p className="text-[11px] text-slate-400">
                AI semantic search grounded in verified merchant inventory
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="overflow-y-auto p-6 flex-1 space-y-4">
          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex items-start gap-3 ${
                msg.sender === 'user' ? 'justify-end' : 'justify-start'
              }`}
            >
              {msg.sender === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center text-white flex-shrink-0 mt-0.5">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-xs space-y-3 ${
                  msg.sender === 'user'
                    ? 'bg-indigo-600 text-white font-medium ml-12'
                    : 'bg-slate-950/80 border border-slate-800 text-slate-200'
                }`}
              >
                <p className="leading-relaxed whitespace-pre-wrap">{msg.text}</p>

                {/* Embedded Recommended Product Cards */}
                {msg.recommendation && msg.recommendation.recommendedProductIds?.length > 0 && (
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <p className="text-[11px] font-bold text-cyan-400 uppercase tracking-wider flex items-center gap-1">
                      <Sparkles className="w-3 h-3" />
                      <span>Curated Matching Products:</span>
                    </p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                      {msg.recommendation.recommendedProductIds.map((pId) => {
                        const prod = products.find((p) => p.id === pId);
                        if (!prod) return null;

                        return (
                          <div
                            key={prod.id}
                            className="p-3 rounded-xl bg-slate-900 border border-slate-800 flex flex-col justify-between gap-2"
                          >
                            <div className="flex items-center gap-2.5">
                              <img
                                src={prod.images[0]}
                                alt=""
                                className="w-12 h-12 rounded-lg bg-slate-950 object-contain p-1 flex-shrink-0"
                              />
                              <div className="min-w-0">
                                <h4 className="font-semibold text-white truncate text-xs">
                                  {prod.title}
                                </h4>
                                <p className="text-cyan-400 font-bold mt-0.5">
                                  ₹{prod.price.toLocaleString('en-IN')}
                                </p>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 pt-1 border-t border-slate-800/80">
                              <button
                                onClick={() => {
                                  onSelectProduct(prod);
                                  onClose();
                                }}
                                className="flex-1 py-1 px-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-[11px] font-medium transition text-center"
                              >
                                View Specs
                              </button>
                              <button
                                onClick={() => addToCart(prod.id, 1)}
                                className="py-1 px-2.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-[11px] font-bold flex items-center gap-1 transition"
                              >
                                <ShoppingCart className="w-3 h-3" />
                                <span>Add</span>
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {msg.recommendation.adviceTips?.length > 0 && (
                      <div className="pt-2 text-[11px] text-slate-400 space-y-1">
                        <span className="font-semibold text-slate-300 flex items-center gap-1">
                          <Lightbulb className="w-3 h-3 text-amber-400" />
                          <span>Shopper Advice:</span>
                        </span>
                        {msg.recommendation.adviceTips.map((tip, tIdx) => (
                          <p key={tIdx}>• {tip}</p>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>

              {msg.sender === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-slate-800 flex items-center justify-center text-slate-300 flex-shrink-0 mt-0.5">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <Bot className="w-4 h-4 text-indigo-400 animate-spin" />
              <span>Analyzing specs and verified seller catalog...</span>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        {messages.length <= 2 && (
          <div className="px-6 py-2 bg-slate-950/40 border-t border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs no-scrollbar">
            <span className="text-[11px] text-slate-500 flex-shrink-0">Suggestions:</span>
            {quickPrompts.map((p, i) => (
              <button
                key={i}
                onClick={() => handleSend(p)}
                className="px-2.5 py-1 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-300 text-[11px] whitespace-nowrap transition border border-slate-700/60"
              >
                {p}
              </button>
            ))}
          </div>
        )}

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-800 bg-slate-950">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={inputQuery}
              onChange={(e) => setInputQuery(e.target.value)}
              placeholder="Ask anything, e.g. 'I need a fast laptop for study and programming'..."
              className="flex-1 bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 focus:border-indigo-500 focus:outline-none"
            />
            <button
              type="submit"
              disabled={!inputQuery.trim() || loading}
              className="px-4 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-xs flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition disabled:opacity-40"
            >
              <span>Ask AI</span>
              <Send className="w-3.5 h-3.5" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
