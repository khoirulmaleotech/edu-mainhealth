import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function StrategyPage() {
  return (
    <div className="bg-background text-on-surface font-sans overflow-x-hidden min-h-screen">
      {/* Background Atmospheric Elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="decorative-circle absolute top-[-10%] right-[-5%] w-[600px] h-[600px] bg-teal-action/5 rounded-full animate-pulse-slow"></div>
        <div className="decorative-circle absolute bottom-[-10%] left-[-5%] w-[500px] h-[500px] bg-orange-accent/5 rounded-full animate-pulse-slow"></div>
      </div>

      <Navbar activePath="/strategy" />

      <main className="relative pt-32 pb-section-gap px-margin-mobile md:px-gutter max-w-container-max mx-auto">
        {/* Hero Section */}
        <section className="mb-section-gap">
          <div className="max-w-3xl">
            <span className="inline-block px-3 py-1 bg-teal-action/10 text-teal-action border border-teal-action/20 rounded-full font-label-caps text-label-caps mb-4">Master Plan 2026-2027</span>
            <h1 className="font-display-lg text-display-lg mb-stack-lg leading-tight text-navy-deep">Strategi Transformasi Digital</h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-2xl">Visi kami adalah menciptakan ekosistem pendidikan digital yang mandiri, berkelanjutan, dan merata di seluruh Nusantara melalui kolaborasi strategis TJSL.</p>
          </div>
        </section>

        {/* Strategy Pillars: 3-Column Layout */}
        <section className="mb-section-gap">
          <h2 className="font-headline-lg text-headline-lg mb-12 flex items-center gap-4 text-navy-deep">
            <span className="w-12 h-1 bg-teal-action"></span>
            Pilar Transformasi
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Pillar 1 */}
            <div className="glass-card p-8 rounded-xl flex flex-col h-full group">
              <div className="w-14 h-14 bg-teal-action/10 border border-teal-action/20 rounded-xl flex items-center justify-center mb-6 text-teal-action group-hover:bg-teal-action/20 transition-colors">
                <span className="material-symbols-outlined text-4xl">hub</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-4 text-teal-action">Infrastruktur Nasional</h3>
              <p className="text-on-surface-variant mb-6 flex-grow">Pembangunan hub digital strategis sebagai pusat syaraf distribusi konten dan konektivitas pendidikan di Indonesia.</p>
              <ul className="space-y-3 border-t border-slate-100 pt-6">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-teal-action text-xl" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                  <span className="text-body-md text-on-surface">12 Kota Hub Nasional</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-teal-action text-xl" style={{fontVariationSettings: "'FILL' 1"}}>check_circle</span>
                  <span className="text-body-md text-on-surface">Optimalisasi Backbone Fiber</span>
                </li>
              </ul>
            </div>

            {/* Pillar 2 */}
            <div className="glass-card p-8 rounded-xl flex flex-col h-full group">
              <div className="w-14 h-14 bg-orange-accent/10 border border-orange-accent/20 rounded-xl flex items-center justify-center mb-6 text-orange-accent group-hover:bg-orange-accent/20 transition-colors">
                <span className="material-symbols-outlined text-4xl">account_balance</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-4 text-orange-accent">Tata Kelola &amp; Ownership</h3>
              <p className="text-on-surface-variant mb-6 flex-grow">Migrasi manajemen dari inisiasi hibah menjadi aset strategis korporasi di bawah naungan Telkom Indonesia.</p>
              <ul className="space-y-3 border-t border-slate-100 pt-6">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-orange-accent text-xl" style={{fontVariationSettings: "'FILL' 1"}}>sync</span>
                  <span className="text-body-md text-on-surface">Transfer Strategis ke Telkom</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-orange-accent text-xl" style={{fontVariationSettings: "'FILL' 1"}}>sync</span>
                  <span className="text-body-md text-on-surface">Standardisasi Operasional</span>
                </li>
              </ul>
            </div>

            {/* Pillar 3 */}
            <div className="glass-card p-8 rounded-xl flex flex-col h-full group">
              <div className="w-14 h-14 bg-teal-action/10 border border-teal-action/20 rounded-xl flex items-center justify-center mb-6 text-teal-action group-hover:bg-teal-action/20 transition-colors">
                <span className="material-symbols-outlined text-4xl">monetization_on</span>
              </div>
              <h3 className="font-headline-md text-headline-md mb-4 text-teal-action">Keberlanjutan</h3>
              <p className="text-on-surface-variant mb-6 flex-grow">Implementasi monetisasi melalui model B2B untuk menjamin kelangsungan inovasi tanpa ketergantungan penuh pada hibah.</p>
              <ul className="space-y-3 border-t border-slate-100 pt-6">
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-teal-action text-xl" style={{fontVariationSettings: "'FILL' 1"}}>trending_up</span>
                  <span className="text-body-md text-on-surface">Model Bisnis B2B &amp; Enterprise</span>
                </li>
                <li className="flex items-start gap-3">
                  <span className="material-symbols-outlined text-teal-action text-xl" style={{fontVariationSettings: "'FILL' 1"}}>trending_up</span>
                  <span className="text-body-md text-on-surface">Ekosistem Edukasi Mandiri</span>
                </li>
              </ul>
            </div>
          </div>
        </section>

        {/* Single Source of Truth Section (Bento Grid Style) */}
        <section className="mb-section-gap">
          <h2 className="font-headline-lg text-headline-lg mb-12 flex items-center gap-4 text-navy-deep">
            <span className="w-12 h-1 bg-orange-accent"></span>
            Data Architecture
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-stretch">
            {/* Main Architecture Visual */}
            <div className="md:col-span-8 glass-card p-12 rounded-xl relative overflow-hidden flex flex-col justify-center min-h-[400px]">
              <div className="relative z-10">
                <h3 className="font-display-lg text-4xl mb-6 text-navy-deep">Single Source of Truth</h3>
                <p className="text-on-surface-variant max-w-lg mb-8">Arsitektur data terpusat yang mengintegrasikan seluruh metrics dari 12 Hub nasional, memastikan akurasi pelaporan dan pengambilan keputusan secara real-time.</p>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8">
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-center">
                    <span className="block text-metric-num font-metric-num text-teal-action">12</span>
                    <span className="text-label-caps font-label-caps text-slate-text">Cities Hub</span>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-center">
                    <span className="block text-metric-num font-metric-num text-teal-action">100%</span>
                    <span className="text-label-caps font-label-caps text-slate-text">Sync Rate</span>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-center">
                    <span className="block text-metric-num font-metric-num text-teal-action">Real</span>
                    <span className="text-label-caps font-label-caps text-slate-text">Time Data</span>
                  </div>
                  <div className="p-4 bg-slate-50 border border-slate-100 rounded-lg text-center">
                    <span className="block text-metric-num font-metric-num text-teal-action">24/7</span>
                    <span className="text-label-caps font-label-caps text-slate-text">Monitoring</span>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Side Features */}
            <div className="md:col-span-4 flex flex-col gap-8">
              <div className="glass-card p-8 rounded-xl flex-1 border-l-4 border-l-teal-action">
                <span className="material-symbols-outlined text-teal-action mb-4">security</span>
                <h4 className="font-headline-md text-headline-md mb-2 text-navy-deep">Integrated Security</h4>
                <p className="text-on-surface-variant text-body-md">Data terlindungi dengan enkripsi enterprise-grade Telkom.</p>
              </div>
              <div className="glass-card p-8 rounded-xl flex-1 border-l-4 border-l-orange-accent">
                <span className="material-symbols-outlined text-orange-accent mb-4">analytics</span>
                <h4 className="font-headline-md text-headline-md mb-2 text-navy-deep">Predictive Analysis</h4>
                <p className="text-on-surface-variant text-body-md">AI-driven insight untuk tren pendidikan masa depan.</p>
              </div>
            </div>
          </div>
        </section>

        {/* Visualization / Map Placeholder Section */}
        <section className="mb-section-gap">
          <div className="glass-card rounded-2xl overflow-hidden p-8 md:p-16 flex flex-col md:flex-row items-center gap-12 bg-slate-50">
            <div className="md:w-1/2">
              <h2 className="font-headline-lg text-headline-lg mb-6 text-navy-deep">Sebaran Infrastruktur Nasional</h2>
              <p className="text-on-surface-variant mb-8">Program kami telah berhasil divalidasi melalui pilot project di Bukittinggi dan kini sedang melakukan ekspansi strategis ke wilayah Jawa dan Sulawesi untuk menjangkau 12 kota di 12 provinsi di seluruh Nusantara.</p>
              
              <div className="space-y-6">
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-action/10 flex items-center justify-center text-teal-action font-bold">1</div>
                  <div>
                    <span className="block font-bold text-navy-deep">Sumatera Hub</span>
                    <span className="text-sm text-slate-text">Pilot Project: Bukittinggi (Selesai)</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-teal-action/10 flex items-center justify-center text-teal-action font-bold">2</div>
                  <div>
                    <span className="block font-bold text-navy-deep">Jawa Hub</span>
                    <span className="text-sm text-slate-text">Jakarta, Bandung, Surabaya (Preparation &amp; Setup)</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-orange-accent/10 flex items-center justify-center text-orange-accent font-bold">3</div>
                  <div>
                    <span className="block font-bold text-navy-deep">Sulawesi Expansion</span>
                    <span className="text-sm text-slate-text">On-going: Makassar &amp; Selayar (Juli 2026)</span>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-12 h-12 rounded-full bg-slate-200 flex items-center justify-center text-slate-text font-bold">4</div>
                  <div>
                    <span className="block font-bold text-navy-deep">Ekspansi Nasional</span>
                    <span className="text-sm text-slate-text">8 kota tersisa (Target 2027)</span>
                  </div>
                </div>
              </div>
            </div>
            <div className="md:w-1/2 w-full h-[400px] rounded-xl bg-slate-200 overflow-hidden relative border border-slate-300 group shadow-inner">
              <div className="absolute inset-0 grayscale group-hover:grayscale-0 transition-all duration-700" style={{ backgroundImage: "url('https://lh3.googleusercontent.com/aida-public/AB6AXuDh6__8AgQQwIHBE7MD3iJ__5kWSx1RVXSYszWbFGlwCdfsd0ah2vCvuVm4K0lD1shhcof-JbTo7-huTV6cRkzyngMUa6CM41EDTiJdqNpazvEhm1mIe4Lhs_4QKcmgR-a0nL8XOEg3RZkAfo_ax0ZD6_xmlKWiZf73AhWtv66RGnKLu6BXe1KGU3GUtwrBJj4auSKsWhzvSbAPXyLCrMv1U1wSl4LhUPIojJkgQCBcHXmn6RHpV2DkjWgQ0YkN__o-6owYtXESlZs')", backgroundSize: "cover", backgroundPosition: "center" }}></div>
              <div className="absolute inset-0 bg-gradient-to-t from-white/40 to-transparent opacity-60"></div>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
