import React from 'react';
import Link from 'next/link';
import { ShieldCheck, Zap, Lock, Cpu, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950 text-slate-400">
      {/* Privacy guarantee bar */}
      <div className="border-b border-slate-800/40 bg-indigo-950/20 py-6">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3">
            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20">
                <Lock className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">100% Client-Side Privacy</h4>
                <p className="text-xs text-slate-400">Files never leave your device or reach any server</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20">
                <Zap className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">Instant WASM Speed</h4>
                <p className="text-xs text-slate-400">Local WebAssembly & Web Worker execution</p>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20">
                <Cpu className="h-5 w-5" />
              </div>
              <div>
                <h4 className="text-sm font-semibold text-white">No File Size Limits</h4>
                <p className="text-xs text-slate-400">Limited only by your device memory</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Navigation */}
      <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span>Powered by</span>
            <span className="font-semibold text-slate-200">pdf-lib</span>
            <span>&bull;</span>
            <span className="font-semibold text-slate-200">PDF.js</span>
            <span>&bull;</span>
            <span className="font-semibold text-slate-200">Next.js</span>
          </div>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <Link href="/merge" className="transition-colors hover:text-indigo-400">Merge PDF</Link>
            <Link href="/organize" className="transition-colors hover:text-indigo-400">Organize & Rotate</Link>
            <Link href="/pdf-to-img" className="transition-colors hover:text-indigo-400">PDF to Image</Link>
            <Link href="/img-to-pdf" className="transition-colors hover:text-indigo-400">Image to PDF</Link>
          </div>

          <p className="text-xs text-slate-400">
            &copy; {new Date().getFullYear()} PDFExpress. Pure client-side utility.
          </p>
        </div>
      </div>
    </footer>
  );
};
