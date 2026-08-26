'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { 
  FileText, 
  Layers, 
  Grid, 
  Image as ImageIcon, 
  FileImage, 
  ShieldCheck, 
  Menu, 
  X, 
  Sparkles 
} from 'lucide-react';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { name: 'Dashboard', href: '/', icon: Sparkles },
  { name: 'Merge PDF', href: '/merge', icon: Layers },
  { name: 'Organize & Split', href: '/organize', icon: Grid },
  { name: 'PDF to Image', href: '/pdf-to-img', icon: ImageIcon },
  { name: 'Image to PDF', href: '/img-to-pdf', icon: FileImage },
];

export const Navbar: React.FC = () => {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-slate-800/80 bg-slate-950/80 backdrop-blur-xl transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        {/* Brand Logo */}
        <Link 
          href="/" 
          className="group flex items-center gap-3 transition-transform hover:scale-[1.02]"
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-violet-500 shadow-lg shadow-indigo-500/25 ring-1 ring-white/20">
            <FileText className="h-5 w-5 text-white transition-transform group-hover:rotate-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold tracking-tight text-white text-lg sm:text-xl">
                PDF<span className="bg-gradient-to-r from-indigo-400 to-violet-400 bg-clip-text text-transparent">Express</span>
              </span>
              <span className="hidden rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-medium text-emerald-400 ring-1 ring-emerald-500/20 sm:inline-flex items-center gap-1">
                <ShieldCheck className="h-3 w-3" /> Client-Side
              </span>
            </div>
            <p className="hidden text-[11px] text-slate-400 md:block">
              Zero-Server &bull; Private &bull; Blazing Fast
            </p>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <nav className="hidden items-center gap-1 md:flex">
          {NAV_ITEMS.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-2 rounded-lg px-3.5 py-2 text-sm font-medium transition-all',
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-300 ring-1 ring-indigo-500/30 shadow-sm'
                    : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                )}
              >
                <Icon className={cn('h-4 w-4', isActive ? 'text-indigo-400' : 'text-slate-400')} />
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Action / Privacy Indicator */}
        <div className="hidden items-center gap-3 lg:flex">
          <div className="flex items-center gap-1.5 rounded-full bg-slate-900 px-3 py-1 text-xs text-slate-400 ring-1 ring-slate-800">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>100% In-Browser WASM</span>
          </div>
        </div>

        {/* Mobile menu button */}
        <div className="flex md:hidden">
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="inline-flex items-center justify-center rounded-lg p-2 text-slate-400 hover:bg-slate-800 hover:text-white"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile menu dropdown */}
      {mobileMenuOpen && (
        <div className="border-b border-slate-800 bg-slate-950/95 px-4 pb-4 pt-2 md:hidden animate-fade-in">
          <div className="flex flex-col space-y-1">
            {NAV_ITEMS.map((item) => {
              const Icon = item.icon;
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    'flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium',
                    isActive
                      ? 'bg-indigo-600/20 text-indigo-300'
                      : 'text-slate-300 hover:bg-slate-900 hover:text-white'
                  )}
                >
                  <Icon className="h-4 w-4" />
                  {item.name}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </header>
  );
};
