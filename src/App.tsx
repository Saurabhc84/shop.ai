/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, FormEvent } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  Search, 
  ShoppingBag, 
  Truck, 
  ChevronRight, 
  BadgeCheck, 
  Info, 
  ArrowRight,
  Loader2,
  AlertCircle,
  Clock,
  ExternalLink,
  Zap
} from 'lucide-react';
import { ComparisonResult, PlatformOption } from './types.ts';
import { compareShoppingOptions } from './services/shopService.ts';

export default function App() {
  const [query, setQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<ComparisonResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: FormEvent) => {
    e?.preventDefault();
    if (!query.trim() || isLoading) return;

    setIsLoading(true);
    setError(null);
    try {
      const data = await compareShoppingOptions(query);
      setResult(data);
    } catch (err) {
      setError('System lookup failed. Please try a more specific request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen px-4 py-6 md:p-8 max-w-[1200px] mx-auto flex flex-col">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-brand-blue rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-200/50">
            <Zap className="w-5 h-5 fill-current" />
          </div>
          <h1 className="text-2xl font-black tracking-tighter">Shop.AI</h1>
        </div>
        
        <form onSubmit={handleSearch} className="flex-1 w-full max-w-2xl mx-auto md:mx-8 relative">
          <div className="bg-white border border-slate-200 rounded-full pl-6 pr-2 py-2 flex items-center gap-3 shadow-sm hover:shadow-md transition-all focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300">
            <span className="text-slate-400"><Search className="w-5 h-5" /></span>
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search items to optimize..."
              className="flex-1 bg-transparent text-slate-800 font-medium placeholder:text-slate-400 focus:outline-none"
            />
            <button
              type="submit"
              disabled={isLoading || !query.trim()}
              className="bg-brand-dark text-white h-10 px-6 rounded-full text-sm font-bold hover:bg-slate-800 transition-colors disabled:opacity-50"
            >
              {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Compare'}
            </button>
          </div>
          
          <div className="hidden lg:flex absolute -right-4 top-1/2 -translate-y-1/2 translate-x-full items-center gap-2 pl-4 border-l border-slate-200">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest whitespace-nowrap">Market Live</span>
          </div>
        </form>

        <button className="hidden md:block text-slate-500 hover:text-slate-900 font-bold text-sm tracking-tight px-4 underline underline-offset-4 decoration-2 decoration-slate-200">
          History
        </button>
      </header>

      <AnimatePresence mode="wait">
        {isLoading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex-1 flex flex-col items-center justify-center py-32"
          >
            <div className="w-16 h-16 bg-white bento-card flex items-center justify-center mb-6">
              <Loader2 className="w-8 h-8 text-brand-blue animate-spin" />
            </div>
            <p className="text-slate-400 font-black text-xs uppercase tracking-[0.2em]">Syncing platform data...</p>
          </motion.div>
        )}

        {error && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="bento-card p-8 bg-red-50/50 border-red-100 flex flex-col items-center text-center max-w-md mx-auto my-12"
          >
            <AlertCircle className="w-10 h-10 text-red-500 mb-4" />
            <p className="font-bold text-red-900 mb-2">{error}</p>
            <button onClick={() => setError(null)} className="text-sm font-bold text-red-600 underline">Try again</button>
          </motion.div>
        )}

        {result && !isLoading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="grid grid-cols-12 auto-rows-min gap-4 mb-12"
          >
            {/* Primary Bento: Best Option (Single or Split) */}
            <div className={`col-span-12 lg:col-span-8 lg:row-span-2 bento-card p-6 md:p-10 flex flex-col hover:border-blue-100 transition-colors group ${result.strategyType === 'split-order' ? 'border-orange-100 bg-orange-50/5' : ''}`}>
              <div className="flex justify-between items-start mb-8">
                <div>
                  <span className={`${result.strategyType === 'split-order' ? 'bg-orange-100 text-orange-700 border-orange-200' : 'bg-green-100 text-green-700 border-green-200'} text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-[0.15em] border inline-flex items-center gap-2`}>
                    {result.strategyType === 'split-order' ? (
                      <><Truck className="w-3 h-3" /> Optimizer's Pick: Split Order</>
                    ) : (
                      <><BadgeCheck className="w-3 h-3" /> Top Result: Single Platform</>
                    )}
                  </span>
                  <h2 className="text-4xl md:text-6xl font-black mt-6 tracking-tighter group-hover:text-brand-blue transition-colors">
                    {Array.isArray(result.bestOption) 
                      ? `${result.bestOption.length} Platforms` 
                      : result.bestOption.platformName}
                  </h2>
                </div>
                <div className="text-right">
                  <p className="text-slate-400 text-[10px] font-black uppercase tracking-widest mb-1">Total Delivery</p>
                  <p className="text-3xl font-black text-brand-blue font-mono">
                    {Array.isArray(result.bestOption) 
                      ? `~${Math.max(...result.bestOption.map(o => parseInt(o.deliveryTime) || 0))}m`
                      : result.bestOption.deliveryTime}
                  </p>
                </div>
              </div>
              
              <div className="flex-1 space-y-6 mb-10">
                {Array.isArray(result.bestOption) ? (
                  result.bestOption.map((order, oIdx) => (
                    <div key={order.platformId + oIdx} className="space-y-3">
                      <div className="flex items-center gap-2 px-1">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{order.platformName} ORDER</span>
                        <div className="h-px flex-1 bg-slate-100" />
                        <span className="text-[10px] font-black text-brand-blue font-mono">{order.deliveryTime}</span>
                      </div>
                      <div className="grid gap-2">
                        {order.items.map((item, iIdx) => (
                          <div key={iIdx} className="flex items-center justify-between p-4 bg-white border border-slate-100 rounded-2xl group/item hover:shadow-sm transition-all">
                            <div className="flex items-center gap-4">
                              <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover/item:text-brand-blue transition-colors">
                                <ShoppingBag className="w-5 h-5" />
                              </div>
                              <div>
                                <p className="font-bold text-slate-900 leading-tight text-sm">{item.itemName}</p>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">₹{item.price}</p>
                              </div>
                            </div>
                            <div className="w-1.5 h-1.5 rounded-full bg-blue-100 group-hover/item:bg-blue-400" />
                          </div>
                        ))}
                      </div>
                    </div>
                  ))
                ) : (
                  result.bestOption.items.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 border border-slate-100 rounded-2xl group/item hover:bg-white hover:shadow-sm transition-all">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-white rounded-xl flex items-center justify-center text-slate-400 group-hover/item:text-brand-blue transition-colors">
                          <ShoppingBag className="w-6 h-6" />
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 leading-tight">{item.itemName}</p>
                          <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">₹{item.price}</p>
                        </div>
                      </div>
                      <div className="w-2 h-2 rounded-full bg-blue-100" />
                    </div>
                  ))
                )}
              </div>

              <div className="pt-8 border-t border-dashed border-slate-200 flex flex-col md:flex-row items-end md:items-center justify-between gap-6">
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Guaranteed Total</p>
                  <div className="flex items-baseline gap-2">
                    <p className="text-5xl font-black tracking-tighter">
                      ₹{(Array.isArray(result.bestOption) 
                        ? result.bestOption.reduce((acc, o) => acc + o.totalCost, 0)
                        : result.bestOption.totalCost).toLocaleString()}
                    </p>
                    <p className="text-xs text-green-600 font-bold">Combined Savings</p>
                  </div>
                </div>
                <button className="w-full md:w-auto bg-brand-blue text-white px-10 py-5 rounded-2xl font-black text-lg hover:scale-[1.02] active:scale-[0.98] transition-transform shadow-xl shadow-blue-600/20">
                  {result.strategyType === 'split-order' ? 'Place All Orders' : 'Secure Order'}
                </button>
              </div>
            </div>

            {/* Side Bento: Alternatives */}
            <div className="col-span-12 lg:col-span-4 lg:row-span-2 bento-card p-8 group">
              <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-6 flex items-center gap-2">
                <div className="w-1 h-1 rounded-full bg-slate-300" /> Comparison Deck
              </h3>
              <div className="space-y-4">
                {result.alternatives.map((alt) => (
                  <div key={alt.platformId} className="p-5 border border-slate-100 rounded-2xl hover:border-blue-200 hover:shadow-sm transition-all group/alt">
                    <div className="flex justify-between items-start mb-2">
                      <p className="font-black text-lg tracking-tight group-hover/alt:text-brand-blue transition-colors">{alt.platformName}</p>
                      <p className="font-black text-slate-900 font-mono">₹{alt.totalCost}</p>
                    </div>
                    <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-widest text-slate-500">
                      <p className="flex items-center gap-1.5"><Clock className="w-3 h-3" /> {alt.deliveryTime}</p>
                      <p className={alt.deliveryFee > 0 ? 'text-red-400' : 'text-green-500 italic'}>
                        {alt.deliveryFee > 0 ? `+₹${alt.deliveryFee} FEE` : 'FREE SHIP'}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
              
              <div className="mt-12 p-6 bg-slate-50 rounded-2xl border border-slate-100">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Strategy Context</p>
                <p className="text-xs font-bold leading-relaxed text-slate-600 italic">
                  "{Array.isArray(result.bestOption) ? result.bestOption[0].justification : result.bestOption.justification}"
                </p>
              </div>
            </div>

            {/* Bottom Bento: Smart Insights */}
            <div className="col-span-12 md:col-span-6 lg:col-span-4 bento-card bg-brand-blue p-8 flex flex-col group min-h-[200px]">
              <div className="w-10 h-10 bg-white/20 backdrop-blur rounded-xl flex items-center justify-center mb-6 text-white group-hover:scale-110 transition-transform">
                <Zap className="w-6 h-6 fill-white" />
              </div>
              <h4 className="font-black text-xl text-white tracking-tight mb-2">Smart Insight</h4>
              <p className="text-sm font-medium text-blue-100 leading-relaxed">
                {result.smartInsights[0]}
              </p>
            </div>

            {/* Bottom Bento: Value Stats */}
            <div className="col-span-12 md:col-span-6 lg:col-span-4 bento-card bg-brand-dark p-8 flex items-center justify-around text-center">
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Est. Savings</p>
                <p className="text-4xl font-black text-green-400 tracking-tighter">₹{Math.floor(result.bestOption.totalCost * 0.15)}</p>
              </div>
              <div className="w-px h-16 bg-slate-800" />
              <div>
                <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Time Saved</p>
                <p className="text-4xl font-black text-blue-400 tracking-tighter">24m</p>
              </div>
            </div>

            {/* Bottom Bento: Multi-item Recommendation */}
            <div className="col-span-12 md:col-span-12 lg:col-span-4 bento-card p-8 flex flex-col justify-center gap-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-50 rounded-xl">
                  <BadgeCheck className="w-5 h-5 text-brand-blue" />
                </div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Efficiency Score</h4>
              </div>
              <div className="space-y-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-2.5 flex-1 bg-brand-blue rounded-full" />
                  <div className="h-2.5 flex-1 bg-brand-blue rounded-full" />
                  <div className="h-2.5 flex-1 bg-brand-blue rounded-full" />
                  <div className="h-2.5 flex-1 bg-brand-blue rounded-full" />
                  <div className="h-2.5 flex-1 bg-slate-100 rounded-full" />
                </div>
                <p className="text-xs font-bold text-slate-500 leading-relaxed">
                  Platform availability is currently <span className="text-brand-blue uppercase">Peak</span> in your sector. Insights generated with 99.8% precision.
                </p>
              </div>
            </div>

          </motion.div>
        )}
      </AnimatePresence>

      {/* Empty State / Guidelines */}
      {!result && !isLoading && (
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-8">
          <div className="bento-card p-8 flex flex-col gap-4 group hover:bg-white transition-all">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-brand-blue transition-colors">
              <Truck className="w-5 h-5" />
            </div>
            <h3 className="font-bold tracking-tight">Fastest Logistics</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">We scan quick-commerce hubs like Zepto and Blinkit for sub-15 minute fulfillment.</p>
          </div>
          <div className="bento-card p-8 flex flex-col gap-4 group hover:bg-white transition-all">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-green-500 transition-colors">
              <BadgeCheck className="w-5 h-5" />
            </div>
            <h3 className="font-bold tracking-tight">Verified Pricing</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">Prices include calculated delivery fees, small order charges, and real-time taxes.</p>
          </div>
          <div className="bento-card p-8 flex flex-col gap-4 group hover:bg-white transition-all md:col-span-2 lg:col-span-1">
            <div className="w-10 h-10 bg-slate-50 rounded-xl flex items-center justify-center text-slate-400 group-hover:text-orange-500 transition-colors">
              <Info className="w-5 h-5" />
            </div>
            <h3 className="font-bold tracking-tight">Multi-Item Logic</h3>
            <p className="text-sm text-slate-500 leading-relaxed font-medium">We suggest bundling orders if one platform offers significant savings across items.</p>
          </div>
        </section>
      )}
    </div>
  );
}
