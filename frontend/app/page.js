import React from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';

export default function Home() {
  return (
    <div className="bg-surface text-on-surface font-sans selection:bg-teal-action/20 min-h-screen">
      <Navbar activePath="/" />

      {/* Hero Section */}
      <header className="relative pt-40 pb-20 overflow-hidden bg-surface">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full max-w-container-max -z-10 pointer-events-none">
          <div className="decorative-circle absolute -top-40 -left-40 w-[600px] h-[600px]"></div>
          <div className="decorative-circle absolute top-40 -right-40 w-[500px] h-[500px] opacity-60"></div>
        </div>
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter grid md:grid-cols-2 items-center gap-stack-lg">
          <div className="flex flex-col gap-stack-md">
            <div className="flex items-center gap-2 px-3 py-1 bg-slate-100 border border-slate-200 w-fit rounded-full">
              <span className="w-2 h-2 rounded-full bg-orange-accent animate-pulse"></span>
              <span className="font-label-caps text-label-caps uppercase text-on-surface-variant">Next-Gen Wellbeing AI</span>
            </div>
            <h1 className="font-display-lg text-headline-lg-mobile md:text-display-lg leading-tight text-navy-deep">
              Aman Bercerita,<br/>
              <span className="text-orange-accent">Sehat Mentalnya.</span>
            </h1>
            <p className="font-body-lg text-body-lg text-on-surface-variant max-w-xl">
              Next-Gen Wellbeing AI Platform for Indonesian Schools. Membangun ekosistem pendidikan yang inklusif, transparan, dan proaktif dalam menjaga kesehatan mental siswa.
            </p>
            <div className="flex flex-wrap gap-stack-md mt-4">
              <Link href="/signup" className="bg-teal-action text-white px-8 py-4 rounded-xl font-label-caps text-label-caps uppercase flex items-center gap-2 group hover:gap-4 transition-all duration-300 shadow-lg shadow-teal-action/20">
                Mulai Curhat Aman
                <span className="material-symbols-outlined">arrow_forward</span>
              </Link>
              <button className="bg-white border border-slate-200 text-on-surface px-8 py-4 rounded-xl font-label-caps text-label-caps uppercase hover:bg-slate-50 transition-colors">
                Lihat Ekosistem
              </button>
            </div>
          </div>
          <div className="relative flex justify-center">
            <div className="w-full aspect-square max-w-[500px] rounded-3xl overflow-hidden glass-card p-2 shadow-2xl shadow-slate-200/50">
              <img alt="Holistic Wellbeing Visual" className="w-full h-full object-cover rounded-2xl" src="https://lh3.googleusercontent.com/aida-public/AB6AXuCtKn122SdPQ9NrzT4In8gc2_OGuSq0BJEyo6jubdgfmJmD-z_ENxrq-dJK0Oz8GvxXF7QN4Yo6IXEpC4KVQScQTLCN3-0T0H-XwoBohcXjnnnhZttNhmWTBnpa_KbqPDJlap83geY-rqGktAfiUBXVjZxvCRIacJXSuIU-Ny_04K-aX_u9jutzWdwKT1RfRmKX6EQtSEUUiYFlX-QjulOYIrB6jWqIeM8EMc0YMnhdTDRH-m7WYufSp68apKU9iQpYfpvg8LFXQBc"/>
              <div className="absolute -bottom-8 -right-8 glass-card p-6 rounded-2xl shadow-xl flex items-center gap-4 bg-white border border-slate-100">
                <div className="w-12 h-12 bg-orange-accent/10 rounded-full flex items-center justify-center">
                  <span className="material-symbols-outlined text-orange-accent" style={{fontVariationSettings: "'FILL' 1"}}>favorite</span>
                </div>
                <div>
                  <p className="font-label-caps text-label-caps text-on-surface-variant">Siswa Terpantau</p>
                  <p className="font-headline-lg text-headline-lg leading-none text-navy-deep">12,450+</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Ecosystem Overview (Bento Grid) */}
      <section className="py-section-gap bg-surface-container-low">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
          <div className="text-center mb-section-gap">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg mb-4 text-navy-deep">EKOSISTEM EDUMIND</h2>
            <p className="text-on-surface-variant max-w-2xl mx-auto">Satu platform terpadu yang menghubungkan berbagai peran kunci untuk memastikan kesejahteraan mental dan akademik siswa secara berkelanjutan.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-12 gap-gutter">
            {/* Student Portal */}
            <div className="md:col-span-8 group">
              <div className="bg-white p-stack-lg rounded-2xl h-full flex flex-col justify-between border border-slate-200 hover:border-teal-action transition-all duration-300 shadow-sm hover:shadow-md">
                <div>
                  <div className="inline-block p-3 bg-teal-action/10 text-teal-action rounded-xl mb-stack-md">
                    <span className="material-symbols-outlined text-3xl">person</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md mb-stack-sm text-navy-deep">Student App</h3>
                  <p className="text-on-surface-variant text-body-md max-w-md">Ruang aman bagi siswa untuk bercerita dengan AI Mood Buddy, melaporkan bullying secara anonim, dan mengeksplorasi minat bakat melalui asesmen AI.</p>
                </div>
                <div className="mt-stack-lg flex items-center justify-between">
                  <Link href="/login" className="text-teal-action font-bold uppercase tracking-wider text-label-caps flex items-center gap-2 group-hover:gap-4 transition-all">MASUK PORTAL <span className="material-symbols-outlined">north_east</span></Link>
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-slate-300"></div>
                    <div className="w-8 h-8 rounded-full border-2 border-white overflow-hidden bg-slate-200"></div>
                    <div className="w-8 h-8 rounded-full border-2 border-white flex items-center justify-center bg-slate-100 text-on-surface-variant text-[10px]">+10k</div>
                  </div>
                </div>
              </div>
            </div>
            {/* Teacher Portal */}
            <div className="md:col-span-4 group">
              <div className="bg-white p-stack-lg rounded-2xl h-full flex flex-col justify-between border border-slate-200 hover:border-orange-accent transition-all duration-300 shadow-sm hover:shadow-md">
                <div>
                  <div className="inline-block p-3 bg-orange-accent/10 text-orange-accent rounded-xl mb-stack-md">
                    <span className="material-symbols-outlined text-3xl">school</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md mb-stack-sm text-navy-deep">Teacher Dashboard</h3>
                  <p className="text-on-surface-variant text-body-md">Heatmap kesejahteraan kelas secara real-time untuk intervensi dini yang lebih humanis dan tepat sasaran.</p>
                </div>
                <div className="mt-stack-lg">
                  <Link href="/login" className="text-orange-accent font-bold uppercase tracking-wider text-label-caps flex items-center gap-2 group-hover:gap-4 transition-all">MASUK PORTAL <span className="material-symbols-outlined">north_east</span></Link>
                </div>
              </div>
            </div>
            {/* Parent Portal */}
            <div className="md:col-span-4 group">
              <div className="bg-white p-stack-lg rounded-2xl h-full flex flex-col justify-between border border-slate-200 hover:border-gold-indicator transition-all duration-300 shadow-sm hover:shadow-md">
                <div>
                  <div className="inline-block p-3 bg-gold-indicator/10 text-gold-indicator rounded-xl mb-stack-md">
                    <span className="material-symbols-outlined text-3xl">family_restroom</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md mb-stack-sm text-navy-deep">Parent Portal</h3>
                  <p className="text-on-surface-variant text-body-md">Pantau tren emosional anak secara transparan tanpa melanggar privasi, memperkuat komunikasi antara rumah dan sekolah.</p>
                </div>
                <div className="mt-stack-lg">
                  <Link href="/login" className="text-gold-indicator font-bold uppercase tracking-wider text-label-caps flex items-center gap-2 group-hover:gap-4 transition-all">MASUK PORTAL <span className="material-symbols-outlined">north_east</span></Link>
                </div>
              </div>
            </div>
            {/* Psychologist Portal */}
            <div className="md:col-span-8 group">
              <div className="bg-white p-stack-lg rounded-2xl h-full flex flex-col justify-between border border-slate-200 hover:border-teal-action transition-all duration-300 shadow-sm hover:shadow-md overflow-hidden relative">
                <div className="relative z-10">
                  <div className="inline-block p-3 bg-teal-action/10 text-teal-action rounded-xl mb-stack-md">
                    <span className="material-symbols-outlined text-3xl">psychology</span>
                  </div>
                  <h3 className="font-headline-md text-headline-md mb-stack-sm text-navy-deep">Psychologist Console</h3>
                  <p className="text-on-surface-variant text-body-md max-w-md">Sistem manajemen kasus klinis terenkripsi dengan asisten AI yang membantu merangkum data anamnesa awal secara akurat.</p>
                </div>
                <div className="mt-stack-lg relative z-10">
                  <Link href="/login" className="text-teal-action font-bold uppercase tracking-wider text-label-caps flex items-center gap-2 group-hover:gap-4 transition-all">MASUK PORTAL <span className="material-symbols-outlined">north_east</span></Link>
                </div>
                <div className="absolute top-0 right-0 w-64 h-64 bg-teal-action/5 rounded-full blur-3xl -mr-20 -mt-20"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Technology Section */}
      <section className="py-section-gap relative bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter grid md:grid-cols-2 gap-section-gap items-center">
          <div className="order-2 md:order-1">
            <div className="bg-navy-deep rounded-3xl p-stack-lg border border-slate-800 relative overflow-hidden shadow-2xl">
              <div className="flex justify-between items-center mb-8">
                <div className="flex gap-2">
                  <div className="w-3 h-3 rounded-full bg-orange-accent/40"></div>
                  <div className="w-3 h-3 rounded-full bg-teal-action/40"></div>
                  <div className="w-3 h-3 rounded-full bg-white/20"></div>
                </div>
                <span className="text-label-caps text-slate-400/50">SYSTEM_ANALYTICS_v2.0</span>
              </div>
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-slate-300 text-body-md">AI Sentiment Accuracy</span>
                    <span className="text-teal-action font-metric-num text-xl">94.8%</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-teal-action w-[94.8%]"></div>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between items-end">
                    <span className="text-slate-300 text-body-md">Early Risk Detection</span>
                    <span className="text-orange-accent font-metric-num text-xl">82ms</span>
                  </div>
                  <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full bg-orange-accent w-[85%]"></div>
                  </div>
                </div>
                <div className="bg-white/5 border border-white/10 p-4 rounded-xl flex items-center gap-4 mt-8">
                  <div className="w-10 h-10 bg-teal-action rounded-lg flex items-center justify-center">
                    <span className="material-symbols-outlined text-white" style={{fontVariationSettings: "'FILL' 1"}}>monitoring</span>
                  </div>
                  <div>
                    <p className="text-label-caps text-slate-400">Live Detection Status</p>
                    <p className="text-body-md text-white">Observing anonymized patterns...</p>
                  </div>
                  <div className="ml-auto flex gap-1">
                    <div className="w-1 h-4 bg-teal-action/40"></div>
                    <div className="w-1 h-6 bg-teal-action"></div>
                    <div className="w-1 h-3 bg-teal-action/60"></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="order-1 md:order-2 flex flex-col gap-stack-md">
            <h2 className="font-headline-lg text-headline-lg-mobile md:text-headline-lg leading-tight text-navy-deep">
              Teknologi Cerdas Untuk<br/>
              <span className="text-orange-accent">Masa Depan Siswa.</span>
            </h2>
            <div className="space-y-stack-lg mt-stack-md">
              <div className="flex gap-stack-md group">
                <div className="flex-shrink-0 w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-teal-action transition-transform group-hover:scale-110 shadow-sm">
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>smart_toy</span>
                </div>
                <div>
                  <h4 className="font-headline-md text-headline-md mb-1 text-navy-deep">AI Mood Buddy 🤖</h4>
                  <p className="text-on-surface-variant text-body-md">Chatbot empatik yang ditenagai oleh model bahasa besar (LLM) khusus, siap mendengarkan 24/7 dan memberikan respon validasi emosional yang terukur secara pedagogis.</p>
                </div>
              </div>
              <div className="flex gap-stack-md group">
                <div className="flex-shrink-0 w-12 h-12 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-center text-orange-accent transition-transform group-hover:scale-110 shadow-sm">
                  <span className="material-symbols-outlined" style={{fontVariationSettings: "'FILL' 1"}}>shield</span>
                </div>
                <div>
                  <h4 className="font-headline-md text-headline-md mb-1 text-navy-deep">Sistem Lapor Bullying 🔐</h4>
                  <p className="text-on-surface-variant text-body-md">Pelaporan anonim dengan enkripsi end-to-end untuk melindungi identitas pelapor, memastikan keberanian siswa untuk bersuara tidak berujung pada intimidasi tambahan.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Global Reach Stats */}
      <section className="py-section-gap bg-surface">
        <div className="max-w-container-max mx-auto px-margin-mobile md:px-gutter">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-gutter border-y border-slate-100 py-12">
            <div className="text-center">
              <p className="font-metric-num text-headline-lg md:text-metric-num text-teal-action">150+</p>
              <p className="text-label-caps text-on-surface-variant uppercase">Sekolah Binaan</p>
            </div>
            <div className="text-center">
              <p className="font-metric-num text-headline-lg md:text-metric-num text-navy-deep">500k</p>
              <p className="text-label-caps text-on-surface-variant uppercase">Data Terenkripsi</p>
            </div>
            <div className="text-center">
              <p className="font-metric-num text-headline-lg md:text-metric-num text-orange-accent">98%</p>
              <p className="text-label-caps text-on-surface-variant uppercase">Tingkat Resolusi</p>
            </div>
            <div className="text-center">
              <p className="font-metric-num text-headline-lg md:text-metric-num text-navy-deep">24/7</p>
              <p className="text-label-caps text-on-surface-variant uppercase">Dukungan AI</p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
