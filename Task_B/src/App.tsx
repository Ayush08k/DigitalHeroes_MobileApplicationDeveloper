import { useState } from 'react';
import {
  FileSearch,
  AlertTriangle,
  Gauge,
  GitBranch,
  Zap,
  ExternalLink
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export function App() {
  const [activeTab, setActiveTab] = useState<'framework' | 'findings' | 'release' | 'budget'>('framework');

  return (
    <div className="min-h-screen flex flex-col justify-between selection:bg-indigo-500 selection:text-white">
      {/* HEADER */}
      <header className="sticky top-0 z-40 px-4 py-3 bg-black/40 backdrop-blur-xl border-b border-white/10">
        <div className="max-w-6xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-rose-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-rose-500/25">
              <Gauge className="w-5 h-5 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Task B: Code Audit & Performance Governance
              </h1>
              <p className="text-xs text-slate-400">Review & Raise The Bar</p>
            </div>
          </div>

          <nav className="flex items-center gap-1 bg-white/5 p-1 rounded-2xl border border-white/10">
            {[
              { id: 'framework', label: 'a) Review Framework', icon: FileSearch },
              { id: 'findings', label: 'b) Concrete Findings', icon: AlertTriangle },
              { id: 'release', label: 'c) Release Strategy', icon: GitBranch },
              { id: 'budget', label: 'd) Perf Budget', icon: Zap },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center gap-2 px-3 sm:px-4 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/30'
                      : 'text-slate-400 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <Icon className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">{tab.label}</span>
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="max-w-6xl mx-auto px-4 pt-6 pb-16 flex-grow w-full">
        <AnimatePresence mode="wait">
          {/* SECTION A: REVIEW FRAMEWORK */}
          {activeTab === 'framework' && (
            <motion.div
              key="framework"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="glass-panel p-6 space-y-4">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <FileSearch className="w-5 h-5 text-indigo-400" />
                  a) Technical Review Framework (Standard Operating Procedure)
                </h2>
                <p className="text-xs text-slate-300 leading-relaxed">
                  When taking over a legacy app with a 4MB main bundle, slow ship velocity, and low-end device crashes, inspection follows an ordered 4-phase audit.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                  {[
                    {
                      step: 'Phase 1: Bundle Composition & Tree-Shaking Audit',
                      inspect: '`vite-bundle-visualizer`, `webpack-bundle-analyzer`, duplicate lodash/moment instances, heavy un-shaken iconography (Lucide, Material icons).',
                      insight: 'Identifies monolithic bundle bloat causing 4MB size, duplicate dependencies, and unparsed dynamic imports.'
                    },
                    {
                      step: 'Phase 2: Memory & Garbage Collection Profiling',
                      inspect: 'Chrome DevTools Memory Heap Snapshot, detached DOM nodes, uncleared RxJS/WebSocket subscriptions, unmanaged timer loops.',
                      insight: 'Explains OOM (Out-of-Memory) crashes on older devices (e.g. 2GB/3GB RAM Android phones).'
                    },
                    {
                      step: 'Phase 3: Render Cycle & Main Thread Jank Analysis',
                      inspect: 'React DevTools Profiler, unmemoized inline callbacks, layout thrashing, excessive context re-renders.',
                      insight: 'Uncovers low frame rates (< 30 FPS) during section scrolling and page transitions.'
                    },
                    {
                      step: 'Phase 4: CI/CD Pipeline & Delivery Gating',
                      inspect: 'Pull request size, test coverage gates, missing bundle size limits in PR checks, lack of staging canary deployments.',
                      insight: 'Reveals why shipping velocity is slow and regression bugs slip into production releases.'
                    }
                  ].map((item, idx) => (
                    <div key={idx} className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                        {item.step}
                      </span>
                      <p className="text-xs font-semibold text-slate-200">What to Inspect: <span className="font-mono text-indigo-300">{item.inspect}</span></p>
                      <p className="text-xs text-slate-400">Diagnosis Signal: {item.insight}</p>
                    </div>
                  ))}
                </div>
              </div>
            </motion.div>
          )}

          {/* SECTION B: CONCRETE FINDINGS */}
          {activeTab === 'findings' && (
            <motion.div
              key="findings"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="glass-panel p-6 space-y-4">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-400" />
                  b) Concrete Code Review Findings
                </h2>
                <p className="text-xs text-slate-300">
                  Audited against active production codebase (`Task_A` & standard legacy frontend repositories).
                </p>

                <div className="space-y-4">
                  <div className="bg-rose-500/10 p-5 rounded-2xl border border-rose-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-rose-300">Finding 1: Monolithic Synchronous Import (4MB Bundle Source)</span>
                      <span className="text-[10px] font-black uppercase bg-rose-500/20 text-rose-300 px-2 py-0.5 rounded-full">Critical</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      <strong>Code Defect:</strong> Importing full icon sets (`import * as Icons from 'lucide-react'`) and heavy moment/chart libraries statically in entry point `App.tsx`.
                    </p>
                    <div className="bg-black/50 p-3 rounded-xl font-mono text-xs text-rose-300">
                      - import * as Icons from 'lucide-react'; // Pulled 2.8MB icon SVG tree into main bundle
                    </div>
                    <p className="text-xs text-emerald-400">
                      <strong>Remediation:</strong> Tree-shake named imports or lazy-load heavy modules with React `lazy()` and dynamic `import()`.
                    </p>
                  </div>

                  <div className="bg-amber-500/10 p-5 rounded-2xl border border-amber-500/30 space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-sm text-amber-300">Finding 2: Unhandled Listener Memory Leaks (Older Device Crashes)</span>
                      <span className="text-[10px] font-black uppercase bg-amber-500/20 text-amber-300 px-2 py-0.5 rounded-full">High Severity</span>
                    </div>
                    <p className="text-xs text-slate-300">
                      <strong>Code Defect:</strong> Global `window.addEventListener('online')` and WebSocket connections attached inside components without cleanup functions in `useEffect`.
                    </p>
                    <div className="bg-black/50 p-3 rounded-xl font-mono text-xs text-amber-300">
                      useEffect(() =&gt; &#123; window.addEventListener('online', syncHandler); &#125;, []); // Missing cleanup return!
                    </div>
                    <p className="text-xs text-emerald-400">
                      <strong>Remediation:</strong> Always return `() =&gt; window.removeEventListener('online', syncHandler)` to prevent RAM leaks and crash on low-tier hardware.
                    </p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SECTION C: RELEASE PROCESS PROPOSAL */}
          {activeTab === 'release' && (
            <motion.div
              key="release"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="glass-panel p-6 space-y-4">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <GitBranch className="w-5 h-5 text-indigo-400" />
                  c) Proposed Production Release Strategy
                </h2>
                <p className="text-xs text-slate-300">
                  A modern, reliable release workflow designed to increase deployment speed while eliminating regression bugs.
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
                    <h4 className="font-bold text-sm text-indigo-300">1. Branching Strategy (Trunk-Based)</h4>
                    <p className="text-xs text-slate-300">Short-lived feature branches (`feat/short-description`) merged into `main` daily via small PRs (&lt; 300 lines).</p>
                  </div>
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
                    <h4 className="font-bold text-sm text-indigo-300">2. Automated CI/CD Gates</h4>
                    <p className="text-xs text-slate-300">GitHub Actions running `tsc --noEmit`, Vitest test suites, ESLint, and Bundle Size Guard before merge permission.</p>
                  </div>
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
                    <h4 className="font-bold text-sm text-indigo-300">3. Staged Rollout Pipeline</h4>
                    <p className="text-xs text-slate-300">Staging -&gt; 5% Canary Release -&gt; 25% Regional Rollout -&gt; 100% General Availability (GA).</p>
                  </div>
                  <div className="bg-black/40 p-4 rounded-2xl border border-white/5 space-y-2">
                    <h4 className="font-bold text-sm text-indigo-300">4. Crash Monitoring & Auto-Rollback</h4>
                    <p className="text-xs text-slate-300">Sentry / Datadog crash monitoring with threshold alerts. Auto-rollback if crash-free session rate falls below 99.5%.</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* SECTION D: PERFORMANCE BUDGET */}
          {activeTab === 'budget' && (
            <motion.div
              key="budget"
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              className="space-y-6"
            >
              <div className="glass-panel p-6 space-y-4">
                <h2 className="text-xl font-black text-white flex items-center gap-2">
                  <Zap className="w-5 h-5 text-cyan-400" />
                  d) Performance Budget & Enforcement
                </h2>

                <div className="overflow-x-auto rounded-2xl border border-white/10 bg-black/30">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-white/5 text-slate-400 font-semibold">
                      <tr>
                        <th className="p-3">Performance Metric</th>
                        <th className="p-3">Target Threshold</th>
                        <th className="p-3">Enforcement Tool</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-white/5 text-slate-200">
                      <tr>
                        <td className="p-3 font-bold text-white">Main JS Bundle Size</td>
                        <td className="p-3 text-emerald-400 font-extrabold">&le; 250 KB (gzipped)</td>
                        <td className="p-3 font-mono text-slate-300">bundlesize / DangerJS CI</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-white">First Contentful Paint (FCP)</td>
                        <td className="p-3 text-emerald-400 font-extrabold">&le; 1.2s (3G Slow Network)</td>
                        <td className="p-3 font-mono text-slate-300">Lighthouse CI</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-white">Interaction to Next Paint (INP)</td>
                        <td className="p-3 text-emerald-400 font-extrabold">&le; 100 ms</td>
                        <td className="p-3 font-mono text-slate-300">Web Vitals Analytics</td>
                      </tr>
                      <tr>
                        <td className="p-3 font-bold text-white">Frame Rate Rate</td>
                        <td className="p-3 text-emerald-400 font-extrabold">&ge; 60 - 90 FPS</td>
                        <td className="p-3 font-mono text-slate-300">Chrome DevTools Performance Profiler</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {/* MANDATORY REQUIRED FOOTER CREDIT */}
      <footer className="w-full py-5 border-t border-white/10 bg-black/40 backdrop-blur-md">
        <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-medium">
            <span>Task B Technical Review & Governance</span>
            <span>•</span>
            <span>Digital Heroes Developer Task</span>
          </div>

          <div className="flex items-center gap-2 bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20">
            <span>Built for</span>
            <a
              href="https://digitalheroesco.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-bold text-indigo-300 hover:text-indigo-200 flex items-center gap-1 underline underline-offset-4 decoration-indigo-400/50 hover:decoration-indigo-300 transition-all"
            >
              Digital Heroes Training Task
              <ExternalLink className="w-3 h-3" />
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
