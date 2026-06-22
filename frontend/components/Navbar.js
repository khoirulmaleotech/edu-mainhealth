import React from 'react';
import Link from 'next/link';

export default function Navbar({ activePath = "/" }) {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-slate-200">
      <nav className="flex justify-between items-center h-20 px-margin-mobile md:px-gutter max-w-container-max mx-auto">
        <Link href="/" className="flex items-center gap-4">
          <img alt="Telkom Indonesia Logo" className="h-8 w-auto" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDddi4C0BnyR4KvymumFq4insMnYnWv32m44I3dXO9_aHm2v2HMv7JewgskYYhaaNXS91mADwyXQS2xWesxviJOkH3-fv6EqF_NePmXqMyS9apqM3wdv3Bp8X1FUbZfNCV_wk_Fb8ihZJRNSKrgCltsQHDDbGu7ytDZXRkyAVxEpjy0w0xeHf9E22MYtDO1SfQTJW-jJekbpxgs-BemqkCErVt4bHTFEz_RYAb01U4HbFn16D7KnjWrGDNCzaM08UrrRuTFdiTqNTY"/>
          <div className="w-px h-6 bg-slate-200"></div>
          <img alt="TJSL Logo" className="h-8 w-auto" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNSe8iLFG7ik8fEH4_K0E9g2jIbjbeNhNV036VSoi2dGa3dgfx3PQT1VItFmUOuidEWoq4LhtnYgs6c3SXdmmaTs2q1mP5G2QVIlNDRKKZrOXa7Vm4iGHwjvEj1Fe55eDuJbMIzB7nNV-B8-vxQpKKtcE4rgXeCQNVEC-bc2xFbmUOMrvsBcaq1UNLcDzfiHoyNXJKreXsXXyi8ggbEQm1fo_E1IZe8Zrixaie0dFSbGJkFL4SEFsRs2wPiJkcs6GEXvxKgvLOZGI"/>
          <span className="hidden md:inline font-headline-md text-headline-md font-bold text-navy-deep ml-2">EduMind</span>
        </Link>
        <div className="hidden md:flex items-center gap-stack-lg">
          <Link href="/" className={`font-body-md text-body-md ${activePath === '/' ? 'text-teal-action font-bold border-b-2 border-teal-action pb-1' : 'text-on-surface-variant hover:text-teal-action transition-colors duration-200'}`}>Overview</Link>
          <Link href="/strategy" className={`font-body-md text-body-md ${activePath === '/strategy' ? 'text-teal-action font-bold border-b-2 border-teal-action pb-1' : 'text-on-surface-variant hover:text-teal-action transition-colors duration-200'}`}>Strategy</Link>
        </div>
        <Link href="/login" className="bg-teal-action text-white px-6 py-2 rounded-full font-label-caps text-label-caps uppercase active:scale-95 transition-transform hover:brightness-110">
          Masuk Portal
        </Link>
      </nav>
    </header>
  );
}
