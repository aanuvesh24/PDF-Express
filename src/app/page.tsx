'use client';

import React from 'react';
import Link from 'next/link';
import { 
  Layers, 
  Grid, 
  Image as ImageIcon, 
  FileImage, 
  ShieldCheck, 
  Zap, 
  ArrowRight, 
  Lock, 
  CheckCircle2, 
  Cpu, 
  RotateCw,
  Sparkles,
  Download
} from 'lucide-react';
import { cn } from '@/lib/utils';

const TOOLS = [
  {
    id: 'merge',
    title: 'Merge PDF',
    description: 'Combine multiple PDF documents into one unified file with effortless drag-and-drop ordering.',
    href: '/merge',
    icon: Layers,
    badge: 'Popular',
    color: 'from-indigo-500 to-cyan-500',
    borderGlow: 'group-hover:border-indigo-500/50 group-hover:shadow-indigo-500/10',
    tags: ['Multi-file', 'Reorder', 'Instant'],
  },
  {
    id: 'organize',
    title: 'Organize & Rotate',
    description: 'Visually sort, rotate pages 90°/180°, delete unwanted pages, duplicate, and split PDF documents.',
    href: '/organize',
    icon: Grid,
    badge: 'Interactive',
    color: 'from-violet-500 to-purple-500',
    borderGlow: 'group-hover:border-violet-500/50 group-hover:shadow-violet-500/10',
    tags: ['Page Grid', 'Rotate 90°', 'Extract'],
  },
  {
    id: 'pdf-to-img',
    title: 'PDF to Image',
    description: 'Render PDF pages into crisp high-resolution PNG, JPG, or WebP images, packaged into a handy ZIP.',
    href: '/pdf-to-img',
    icon: ImageIcon,
    badge: 'High DPI',
    color: 'from-emerald-500 to-teal-500',
    borderGlow: 'group-hover:border-emerald-500/50 group-hover:shadow-emerald-500/10',
    tags: ['PNG / JPG', '2x/3x DPI', 'ZIP Export'],
  },
  {
    id: 'img-to-pdf',
    title: 'Image to PDF',
    description: 'Convert JPG, PNG, and WebP images into clean, customized PDF documents with A4, Letter, or Fit layouts.',
    href: '/img-to-pdf',
    icon: FileImage,
    badge: 'Customizable',
    color: 'from-rose-500 to-amber-500',
    borderGlow: 'group-hover:border-rose-500/50 group-hover:shadow-rose-500/10',
    tags: ['A4 / Letter', 'Margins', 'Auto-Fit'],
  },
];

export default function HomePage() {
  return (
    <div className="relative overflow-hidden">
      {/* Hero Section */}
      <section className="relative px-4 pt-16 pb-12 sm:px-6 sm:pt-24 lg:px-8">
        <div className="mx-auto max-w-5xl text-center">
          {/* Privacy Pill Badge */}
          <div className="inline-flex items-center gap-2 rounded-full border border-indigo-500/30 bg-indigo-950/40 px-4 py-1.5 text-xs font-semibold text-indigo-300 shadow-inner backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>100% Client-Side Privacy</span>
            <span className="text-slate-500">&bull;</span>
            <span className="text-slate-300">Zero Server Uploads</span>
          </div>

          {/* Main Title */}
          <h1 className="mt-8 text-4xl font-extrabold tracking-tight text-white sm:text-6xl lg:text-7xl">
            Pure Client-Side <br />
            <span className="bg-gradient-to-r from-indigo-400 via-violet-400 to-cyan-400 bg-clip-text text-transparent">
              PDF Powerhouse
            </span>
          </h1>

          <p className="mx-auto mt-6 max-w-2xl text-base text-slate-300 sm:text-lg sm:leading-8">
            Merge, reorganize, rotate, extract, and convert PDFs directly inside your browser. 
            Powered by WebAssembly & Web Workers for blazing speed with zero data leaks.
          </p>

          {/* Quick Action Badges */}
          <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
            <Link
              href="/merge"
              className="group flex items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-3.5 text-sm font-bold text-white shadow-lg shadow-indigo-500/25 transition-all hover:scale-105 hover:shadow-indigo-500/40"
            >
              <Layers className="h-4 w-4" />
              <span>Merge PDFs</span>
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>

            <Link
              href="/organize"
              className="flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-900/80 px-6 py-3.5 text-sm font-bold text-slate-200 transition-all hover:border-slate-600 hover:bg-slate-800 hover:text-white"
            >
              <Grid className="h-4 w-4 text-violet-400" />
              <span>Organize & Rotate</span>
            </Link>
          </div>
        </div>
      </section>

      {/* Main Tools Grid */}
      <section className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Core PDF Utilities</h2>
            <p className="text-sm text-slate-400">Select a tool to get started instantly</p>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-2">
          {TOOLS.map((tool) => {
            const Icon = tool.icon;
            return (
              <Link
                key={tool.id}
                href={tool.href}
                className={cn(
                  'group relative flex flex-col justify-between rounded-3xl border border-slate-800/90 bg-slate-900/60 p-7 backdrop-blur-xl transition-all duration-300',
                  'hover:-translate-y-1 hover:bg-slate-900/90 hover:shadow-2xl',
                  tool.borderGlow
                )}
              >
                <div>
                  <div className="flex items-center justify-between mb-5">
                    <div
                      className={cn(
                        'flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-tr shadow-lg text-white transition-transform group-hover:scale-110',
                        tool.color
                      )}
                    >
                      <Icon className="h-7 w-7" />
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="rounded-full bg-slate-800 px-3 py-1 text-xs font-semibold text-slate-300 ring-1 ring-slate-700">
                        {tool.badge}
                      </span>
                    </div>
                  </div>

                  <h3 className="text-xl font-bold text-white tracking-tight group-hover:text-indigo-300 transition-colors">
                    {tool.title}
                  </h3>

                  <p className="mt-2.5 text-sm leading-relaxed text-slate-400">
                    {tool.description}
                  </p>
                </div>

                <div className="mt-6 flex items-center justify-between border-t border-slate-800/80 pt-4">
                  <div className="flex flex-wrap gap-1.5">
                    {tool.tags.map((tag) => (
                      <span
                        key={tag}
                        className="rounded-md bg-slate-800/60 px-2 py-0.5 text-[11px] font-medium text-slate-400"
                      >
                        {tag}
                      </span>
                    ))}
                  </div>

                  <div className="flex items-center gap-1 text-xs font-bold text-indigo-400 group-hover:translate-x-1 transition-transform">
                    <span>Launch</span>
                    <ArrowRight className="h-3.5 w-3.5" />
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Feature & Privacy Highlights */}
      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 lg:px-8">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/40 p-8 sm:p-12 backdrop-blur-md">
          <div className="text-center max-w-3xl mx-auto mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-white tracking-tight">
              Why 100% Client-Side Processing Matters
            </h2>
            <p className="mt-3 text-sm text-slate-400">
              Unlike traditional PDF web services, your documents never touch a third-party server.
            </p>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-3">
            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500/10 text-emerald-400 ring-1 ring-emerald-500/20 mb-4">
                <Lock className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-white text-base">Uncompromising Privacy</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Bank statements, confidential contracts, and personal IDs remain 100% confined to your device's memory.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-indigo-500/10 text-indigo-400 ring-1 ring-indigo-500/20 mb-4">
                <Zap className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-white text-base">No Upload/Download Lag</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Processing runs at hardware speed without waiting for multi-megabyte network roundtrips.
              </p>
            </div>

            <div className="rounded-2xl border border-slate-800/80 bg-slate-950/60 p-6">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-violet-500/10 text-violet-400 ring-1 ring-violet-500/20 mb-4">
                <Cpu className="h-5 w-5" />
              </div>
              <h3 className="font-bold text-white text-base">Offline Capable PWA</h3>
              <p className="mt-2 text-xs text-slate-400 leading-relaxed">
                Install as a standalone web app. Works completely offline on flights, remote sites, or spotty connections.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
