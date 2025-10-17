"use client";

import { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Menu, X } from 'lucide-react';

export default function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="z-20 relative">
      <div className="flex md:px-8 max-w-7xl mr-auto ml-auto pt-6 pr-6 pb-6 pl-6 items-center justify-between">
        <Link href="/" className="flex items-center gap-3">
          <span className="text-xl tracking-tight text-white/95 font-semibold font-sans">Right Stay Africa</span>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          <Link className="hover:text-white/90 text-sm text-white/80 transition" href="/accommodations">
            Accommodations
          </Link>
          <Link className="hover:text-white/90 text-sm text-white/80 transition" href="/tours">
            Tours
          </Link>
          <Link className="hover:text-white/90 text-sm text-white/80 transition" href="/asset-management">
            Asset Management
          </Link>
          <Link className="hover:text-white/90 text-sm text-white/80 transition" href="/about">
            About
          </Link>
          <Link className="hover:text-white/90 text-sm text-white/80 transition" href="/contact">
            Contact
          </Link>
        </nav>

        <button
          className="md:hidden inline-flex text-white/80 bg-white/5 w-10 h-10 border-white/15 border rounded-xl items-center justify-center"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? (
            <X className="w-[20px] h-[20px]" strokeWidth={1.5} />
          ) : (
            <Menu className="w-[20px] h-[20px]" strokeWidth={1.5} />
          )}
        </button>
      </div>

      {/* Mobile Navigation */}
      <div
        className={`fixed z-20 origin-top transition bg-black/80 border-white/10 border rounded-3xl pt-4 pr-4 pb-4 pl-4 top-20 right-4 left-4 shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)] backdrop-blur ${
          mobileMenuOpen ? 'opacity-100 scale-100 visible' : 'opacity-0 scale-95 invisible'
        }`}
      >
        <div className="flex flex-col gap-4">
          <Link className="hover:bg-white/5 text-sm text-white/85 rounded-md pt-2 pr-3 pb-2 pl-3 transition" href="/accommodations">
            Accommodations
          </Link>
          <Link className="hover:bg-white/5 text-sm text-white/85 rounded-md pt-2 pr-3 pb-2 pl-3 transition" href="/tours">
            Tours
          </Link>
          <Link className="hover:bg-white/5 text-sm text-white/85 rounded-md pt-2 pr-3 pb-2 pl-3 transition" href="/asset-management">
            Asset Management
          </Link>
          <Link className="hover:bg-white/5 text-sm text-white/85 rounded-md pt-2 pr-3 pb-2 pl-3 transition" href="/about">
            About
          </Link>
          <Link className="hover:bg-white/5 text-sm text-white/85 rounded-md pt-2 pr-3 pb-2 pl-3 transition" href="/contact">
            Contact
          </Link>
        </div>
      </div>
    </header>
  );
}

