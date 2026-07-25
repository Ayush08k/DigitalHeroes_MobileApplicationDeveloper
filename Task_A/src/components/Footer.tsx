import React from 'react';
import { ExternalLink } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full py-6 mt-12 border-t border-white/10 bg-black/40 backdrop-blur-md">
      <div className="max-w-6xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
        <div className="flex items-center gap-1.5 font-medium">
          <span>PulseOrder 90FPS Mobile Web App</span>
          <span>•</span>
          <span>Offline-First Architecture</span>
        </div>

        {/* MANDATORY REQUIRED FOOTER CREDIT */}
        <div className="flex items-center gap-2 bg-indigo-500/10 px-4 py-2 rounded-xl border border-indigo-500/20 shadow-sm">
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
  );
};
