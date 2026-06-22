import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-surface-container-low border-t border-slate-200 w-full py-stack-lg">
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter flex flex-col md:flex-row justify-between items-start gap-stack-md">
        <div className="flex flex-col gap-4 max-w-md">
          <div className="flex items-center gap-4">
            <img alt="Telkom Logo" className="h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuDddi4C0BnyR4KvymumFq4insMnYnWv32m44I3dXO9_aHm2v2HMv7JewgskYYhaaNXS91mADwyXQS2xWesxviJOkH3-fv6EqF_NePmXqMyS9apqM3wdv3Bp8X1FUbZfNCV_wk_Fb8ihZJRNSKrgCltsQHDDbGu7ytDZXRkyAVxEpjy0w0xeHf9E22MYtDO1SfQTJW-jJekbpxgs-BemqkCErVt4bHTFEz_RYAb01U4HbFn16D7KnjWrGDNCzaM08UrrRuTFdiTqNTY"/>
            <img alt="TJSL Logo" className="h-6" src="https://lh3.googleusercontent.com/aida-public/AB6AXuBNSe8iLFG7ik8fEH4_K0E9g2jIbjbeNhNV036VSoi2dGa3dgfx3PQT1VItFmUOuidEWoq4LhtnYgs6c3SXdmmaTs2q1mP5G2QVIlNDRKKZrOXa7Vm4iGHwjvEj1Fe55eDuJbMIzB7nNV-B8-vxQpKKtcE4rgXeCQNVEC-bc2xFbmUOMrvsBcaq1UNLcDzfiHoyNXJKreXsXXyi8ggbEQm1fo_E1IZe8Zrixaie0dFSbGJkFL4SEFsRs2wPiJkcs6GEXvxKgvLOZGI"/>
          </div>
          <p className="font-headline-sm text-headline-sm font-bold text-navy-deep mt-2">EduMind Global Wellbeing</p>
          <p className="text-slate-text font-body-md">Memberdayakan ekosistem pendidikan dengan teknologi AI untuk kesehatan mental yang inklusif, aman, dan berkelanjutan bagi seluruh siswa di Indonesia.</p>
        </div>
        <div className="grid grid-cols-2 gap-12">
          <div className="flex flex-col gap-3">
            <p className="font-label-caps text-teal-action uppercase">NAVIGASI</p>
            <Link href="/" className="text-slate-text hover:text-orange-accent transition-colors">Overview</Link>
            <Link href="/strategy" className="text-slate-text hover:text-orange-accent transition-colors">Strategy</Link>
            <Link href="#" className="text-slate-text hover:text-orange-accent transition-colors">Privacy Policy</Link>
            <Link href="#" className="text-slate-text hover:text-orange-accent transition-colors">Contact Support</Link>
          </div>
          <div className="flex flex-col gap-3">
            <p className="font-label-caps text-teal-action uppercase">HUBUNGI KAMI</p>
            <p className="text-slate-text flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">call</span>
              +62 821-4391-0521
            </p>
            <p className="text-slate-text flex items-center gap-2">
              <span className="material-symbols-outlined text-sm">mail</span>
              support@edumind.com
            </p>
          </div>
        </div>
      </div>
      <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter mt-12 pt-8 border-t border-slate-200 text-center md:text-left">
        <p className="text-slate-text text-sm">© 2026 Telkom Indonesia TJSL. All rights reserved. EduMind is a strategic initiative for national digital wellbeing.</p>
      </div>
    </footer>
  );
}
