"use client";
import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { 
  ShieldCheck, 
  MessageCircle, 
  Users, 
  Stethoscope, 
  BarChart3, 
  ArrowRight,
  ChevronRight,
  Star,
  BrainCircuit
} from 'lucide-react';

export default function HomePage() {
  const ecosystem = [
    { title: "Student App", desc: "Curhat aman dengan AI Mood Buddy, lapor bullying anonim, dan eksplorasi minat bakat.", icon: <MessageCircle className="text-primary" />, link: "/dashboard/student" },
    { title: "Parent Portal", desc: "Pantau tren emosional dan bakat anak secara transparan tanpa melanggar privasi chat.", icon: <Star className="text-secondary" />, link: "/dashboard/parent" },
    { title: "Teacher Dashboard", desc: "Heatmap kesejahteraan kelas dan sistem alert dini untuk intervensi guru yang cepat.", icon: <Users className="text-primary" />, link: "/dashboard/teacher" },
    { title: "Psychologist Console", desc: "Manajemen kasus klinis mendalam untuk siswa yang membutuhkan penanganan ahli.", icon: <Stethoscope className="text-secondary" />, link: "/dashboard/psychologist" }
  ];

  return (
    <div className="min-h-screen bg-white font-sans selection:bg-primary selection:text-white">
      {/* NAVBAR */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-xl z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-8 py-5 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/logo-edumainhealth.png" alt="Logo" width={50} height={50} />
            <div className="flex flex-col">
              <span className="text-2xl font-black text-primary leading-none tracking-tighter uppercase">EduMind</span>
              <span className="text-[9px] font-bold text-slate-400 tracking-[0.3em] uppercase">By Maleotech</span>
            </div>
          </Link>
          
          <div className="hidden lg:flex space-x-10 text-sm font-black uppercase tracking-widest text-slate-500">
            <Link href="#ecosystem" className="hover:text-primary transition">Ekosistem</Link>
            <Link href="#features" className="hover:text-primary transition">Fitur Utama</Link>
            <Link href="#security" className="hover:text-primary transition">Keamanan</Link>
          </div>
          
          <Link href="/login" className="bg-slate-900 text-white px-8 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-primary transition-all shadow-xl shadow-slate-200">
            Masuk Portal
          </Link>
        </div>
      </nav>

      {/* HERO SECTION */}
      <section className="pt-48 pb-32 px-8 overflow-hidden">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-20 items-center">
          <div className="space-y-10 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary/10 rounded-full border border-primary/20">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
              </span>
              <span className="text-[10px] font-black text-primary uppercase tracking-widest">Next-Gen Wellbeing AI</span>
            </div>
            <h1 className="text-6xl lg:text-8xl font-black text-slate-900 leading-[0.95] tracking-tighter">
              Aman Bercerita, <br/>
              <span className="text-primary italic">Sehat Mentalnya.</span>
            </h1>
            <p className="text-xl text-slate-500 font-medium leading-relaxed max-w-xl mx-auto lg:mx-0">
              Platform kesehatan mental terpadu yang menghubungkan Siswa, Orang Tua, Guru, dan Psikolog dalam satu ekosistem cerdas.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
              <Link href="/login" className="px-10 py-5 bg-primary text-white rounded-[24px] font-black text-sm uppercase tracking-widest shadow-2xl shadow-primary/30 flex items-center justify-center gap-3 hover:scale-105 transition-all">
                Mulai Curhat Aman <ArrowRight size={18} />
              </Link>
              <Link href="#ecosystem" className="px-10 py-5 bg-white text-slate-900 border-2 border-slate-100 rounded-[24px] font-black text-sm uppercase tracking-widest hover:bg-slate-50 transition-all flex items-center justify-center">
                Lihat Ekosistem
              </Link>
            </div>
          </div>
          <div className="relative flex justify-center">
             <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary/5 rounded-full blur-3xl"></div>
             <Image 
                src="/images/logo-edumainhealth.png" 
                alt="EduMind Mascot" 
                width={450} 
                height={450} 
                className="relative z-10 animate-bounce-slow"
              />
          </div>
        </div>
      </section>

      {/* ECOSYSTEM CARDS */}
      <section id="ecosystem" className="py-32 bg-slate-50 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20 space-y-4">
            <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">Ekosistem EduMind</h2>
            <p className="text-slate-500 font-medium italic">Satu platform, banyak peran, satu tujuan: Kesejahteraan Siswa.</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {ecosystem.map((item, i) => (
              <Link href={item.link} key={i} className="group bg-white p-10 rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-primary/20 transition-all flex flex-col justify-between">
                <div>
                  <div className="w-16 h-16 bg-slate-50 rounded-2xl flex items-center justify-center mb-8 group-hover:scale-110 transition-transform">
                    {item.icon}
                  </div>
                  <h3 className="text-xl font-black text-slate-800 mb-4">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed font-medium mb-8">{item.desc}</p>
                </div>
                <div className="flex items-center gap-2 text-primary font-black text-[10px] uppercase tracking-widest group-hover:gap-4 transition-all">
                  Masuk Portal <ChevronRight size={14} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CORE FEATURES */}
      <section id="features" className="py-32 px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-2 gap-24 items-center">
          <div className="order-2 lg:order-1 relative">
            <div className="bg-slate-900 p-12 rounded-[50px] shadow-2xl relative z-10">
               <h4 className="text-secondary font-black text-xs uppercase tracking-widest mb-6">Real-time Analytics</h4>
               <div className="space-y-6">
                  {[1, 2, 3].map((_, i) => (
                    <div key={i} className="h-4 bg-white/5 rounded-full overflow-hidden">
                      <div className="h-full bg-primary rounded-full transition-all duration-1000" style={{ width: `${30 + (i * 25)}%` }}></div>
                    </div>
                  ))}
               </div>
               <div className="mt-10 p-6 bg-white/5 rounded-3xl border border-white/10 flex gap-4">
                  <div className="w-12 h-12 bg-primary rounded-xl flex items-center justify-center text-white"><BarChart3 size={24}/></div>
                  <div>
                    <p className="text-sm font-bold text-white">AI Early Detection</p>
                    <p className="text-xs text-slate-400 font-medium mt-1">Mendeteksi risiko kesejahteraan mental secara otomatis.</p>
                  </div>
               </div>
            </div>
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-secondary/20 rounded-full blur-3xl animate-pulse"></div>
          </div>
          <div className="order-1 lg:order-2 space-y-10">
            <h2 className="text-5xl font-black text-slate-900 tracking-tighter leading-none">
              Teknologi Cerdas Untuk <br/> <span className="text-primary italic">Masa Depan Siswa.</span>
            </h2>
            <div className="space-y-8">
              <FeatureItem 
                icon={<BrainCircuit className="text-primary" />} 
                title="AI Mood Buddy 🤖" 
                desc="Chat bot empatik yang ditenagai Gemini AI untuk teman curhat 24/7." 
              />
              <FeatureItem 
                icon={<ShieldCheck className="text-secondary" />} 
                title="Sistem Lapor Bullying 🔐" 
                desc="Pelaporan anonim dengan enkripsi tinggi untuk melindungi identitas pelapor." 
              />
            </div>
          </div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-slate-900 text-white pt-32 pb-10 px-8">
        <div className="max-w-7xl mx-auto grid lg:grid-cols-12 gap-20 pb-20 border-b border-white/5">
          <div className="lg:col-span-5 space-y-8">
            <div className="flex items-center gap-4">
              <Image src="/images/logo-edumainhealth.png" alt="Logo" width={60} height={60} className="brightness-125" />
              <div className="flex flex-col">
                <span className="text-3xl font-black text-primary leading-none tracking-tighter uppercase">EduMind</span>
                <span className="text-[10px] font-bold text-slate-500 tracking-[0.3em] uppercase tracking-widest">Global Wellbeing</span>
              </div>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed max-w-sm">
              Memberdayakan ekosistem pendidikan dengan teknologi AI untuk kesehatan mental yang inklusif dan aman.
            </p>
          </div>
          <div className="lg:col-span-3 space-y-8 font-bold uppercase text-[10px] tracking-widest text-slate-500">
            <h4 className="text-white text-sm tracking-normal">Navigasi</h4>
            <ul className="space-y-4">
              <li><Link href="/dashboard/student" className="hover:text-primary transition">Dashboard Student</Link></li>
              <li><Link href="/dashboard/parent" className="hover:text-primary transition">Portal Orang Tua</Link></li>
              <li><Link href="/dashboard/teacher" className="hover:text-primary transition">Teacher Dashboard</Link></li>
            </ul>
          </div>
          <div className="lg:col-span-4 space-y-8">
            <h4 className="text-white font-bold">Kontak Kami</h4>
            <div className="space-y-4 text-slate-400 font-medium">
              <p>📍 Intermark Indonesia Ruko 8, Tangerang Selatan</p>
              <p>📞 +62 821-4391-0521</p>
              <p className="text-primary font-black">✉️ support@maleotech.com</p>
            </div>
          </div>
        </div>
        <div className="text-center pt-10 text-[10px] font-black text-slate-600 uppercase tracking-widest">
          © 2026 PT. Maleo Teknologi Indonesia. Seluruh Hak Cipta Dilindungi.
        </div>
      </footer>
    </div>
  );
}

function FeatureItem({ icon, title, desc }) {
  return (
    <div className="flex gap-6 items-start group">
      <div className="w-14 h-14 bg-slate-50 rounded-2xl flex items-center justify-center shrink-0 group-hover:bg-primary/10 transition-colors">
        {icon}
      </div>
      <div>
        <h4 className="text-xl font-black text-slate-800 mb-2">{title}</h4>
        <p className="text-slate-500 font-medium leading-relaxed text-sm">{desc}</p>
      </div>
    </div>
  );
}