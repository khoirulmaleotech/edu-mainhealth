import Link from 'next/link';
import Image from 'next/image';

export default function HomePage() {
  const features = [
    { title: "AI Mood Buddy", desc: "Teman curhat pintar yang siap mendengarkan 24/7 dengan respons empatik dan tanpa penghakiman.", icon: "🤖" },
    { title: "Handover System", desc: "Transisi mulus dari chat AI ke psikolog profesional saat Anda membutuhkan bantuan lebih mendalam.", icon: "🔄" },
    { title: "Privacy First", desc: "Data enkripsi tingkat tinggi. Privasi anak terjaga sepenuhnya, orang tua tetap merasa tenang.", icon: "🔐" },
    { title: "Mood Analytics", desc: "Laporan tren kesehatan mental berkala untuk memantau perkembangan emosional secara berkala.", icon: "📊" }
  ];

  const testimonials = [
    { name: "Rian", age: "17th", text: "Awalnya malu mau cerita, tapi ngobrol sama bot-nya asik banget dan ngebantu aku berani buat ketemu psikolog asli." },
    { name: "Sari", age: "42th", text: "Dashboard-nya sangat membantu saya memantau kondisi anak tanpa harus memaksa dia bicara kalau dia belum siap." }
  ];

  const faqs = [
    { q: "Apakah chat saya aman?", a: "Sangat aman. Kami menggunakan enkripsi end-to-end untuk melindungi setiap percakapan agar privasi Anda tetap terjaga." },
    { q: "Kapan saya harus hubungi psikolog?", a: "Sistem AI kami akan memberikan rekomendasi otomatis jika percakapan menunjukkan intensitas emosi yang tinggi atau membutuhkan diagnosa ahli." },
    { q: "Bagaimana peran orang tua?", a: "Orang tua mendapatkan dashboard khusus untuk melihat tren mood tanpa melihat detail isi chat pribadi anak, menjaga kepercayaan antara orang tua dan anak." }
  ];

  return (
    <div className="min-h-screen bg-white text-slate-900 leading-relaxed">
      {/* Navbar dengan Logo Baru */}
      <nav className="fixed w-full bg-white/90 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <Link href="/" className="flex items-center gap-3 group">
            <Image 
              src="/images/logo-edumainhealth.png" 
              alt="MainHealth Mascot" 
              width={55} 
              height={55} 
              className="group-hover:scale-105 transition-transform"
            />
            <div className="flex flex-col">
              <span className="text-2xl font-black text-[#00adb5] leading-none tracking-tighter">educourse</span>
              <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em] uppercase">— main health —</span>
            </div>
          </Link>
          
          <div className="hidden md:flex space-x-10 text-base font-semibold">
            <Link href="#about" className="hover:text-primary transition">Tentang</Link>
            <Link href="#features" className="hover:text-primary transition">Fitur</Link>
            <Link href="#faq" className="hover:text-primary transition">FAQ</Link>
          </div>
          
          <Link href="/login" className="bg-primary text-white px-8 py-2.5 rounded-full font-bold text-base hover:opacity-90 transition">
            Masuk
          </Link>
        </div>
      </nav>

      {/* Hero Section dengan Maskot Gajah */}
      <section className="pt-56 pb-28 px-6 text-center bg-gradient-to-b from-[#00adb515] to-white">
        <div className="mb-12 inline-block p-6 bg-white rounded-[40px] shadow-2xl shadow-primary/10 animate-bounce-slow">
           <Image 
              src="/images/logo-edumainhealth.png" 
              alt="Mascot Large" 
              width={180} 
              height={180} 
            />
        </div>
        <h2 className="text-6xl md:text-8xl font-extrabold mb-8 tracking-tight leading-[1.1]">
          Bicara Nyaman, <br/><span className="text-primary">Kesehatan Terjaga.</span>
        </h2>
        <p className="max-w-3xl mx-auto text-slate-600 text-2xl mb-12 leading-relaxed font-medium">
          Platform interaktif yang menghubungkan teknologi AI cerdas dan profesional psikologi untuk mendukung kesehatan emosional Anda.
        </p>
        <Link href="/chat" className="px-14 py-6 bg-secondary text-slate-900 rounded-full font-black text-xl shadow-2xl shadow-yellow-200 hover:scale-105 transition-transform inline-block">
          Mulai Chat Gratis Sekarang
        </Link>
      </section>

      {/* About MainHealth */}
      <section id="about" className="py-32 max-w-6xl mx-auto px-6">
        <div className="grid md:grid-cols-2 gap-16 items-center">
          <div>
            <h3 className="text-4xl font-bold mb-8">Apa itu MainHealth?</h3>
            <p className="text-xl text-slate-600 leading-relaxed mb-6">
              MainHealth adalah jembatan digital bagi siapa saja yang membutuhkan teman bicara. Kami menggabungkan kenyamanan anonimitas bot AI dengan ketajaman analisis psikolog profesional.
            </p>
            <p className="text-xl text-slate-600 leading-relaxed">
              Fokus kami adalah pada penanganan dini kesehatan mental melalui teknologi yang inklusif, aman, dan sangat mudah diakses oleh berbagai kalangan.
            </p>
          </div>
          <div className="bg-primary/5 h-96 rounded-[50px] flex items-center justify-center relative overflow-hidden group">
            <div className="absolute inset-0 bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
            <Image 
              src="/images/logo-edumainhealth.png" 
              alt="Mascot About" 
              width={250} 
              height={250} 
              className="relative z-10"
            />
          </div>
        </div>
      </section>

      {/* Features & Testimonials (Konten Tetap Sama Dengan Ukuran Font Besar) */}
      <section id="features" className="py-32 bg-slate-50 px-6">
        <div className="max-w-7xl mx-auto text-center">
          <h3 className="text-4xl font-bold mb-6">Fitur Unggulan Kami</h3>
          <div className="w-24 h-1.5 bg-secondary mx-auto mb-20"></div>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-10">
            {features.map((f, i) => (
              <div key={i} className="bg-white p-10 rounded-[35px] border border-slate-100 shadow-sm hover:border-primary transition duration-300">
                <div className="text-5xl mb-8">{f.icon}</div>
                <h4 className="text-2xl font-bold mb-4">{f.title}</h4>
                <p className="text-slate-500 text-lg leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-32 px-6 max-w-7xl mx-auto text-center">
        <h3 className="text-4xl font-bold mb-20">Kisah Mereka Yang Terbantu</h3>
        <div className="grid md:grid-cols-2 gap-12 text-left">
          {testimonials.map((t, i) => (
            <div key={i} className="p-12 border-l-[6px] border-secondary bg-slate-50 rounded-r-[40px]">
              <p className="text-2xl italic text-slate-700 mb-8 leading-relaxed font-medium">"{t.text}"</p>
              <div className="text-xl font-bold text-slate-800">{t.name}, <span className="text-primary">{t.age}</span></div>
            </div>
          ))}
        </div>
      </section>

      <section id="faq" className="py-32 bg-primary text-white px-6">
        <div className="max-w-4xl mx-auto">
          <h3 className="text-4xl font-bold text-center mb-16 text-secondary">FAQ</h3>
          <div className="space-y-8">
            {faqs.map((item, i) => (
              <div key={i} className="bg-white/10 backdrop-blur-lg p-8 rounded-3xl border border-white/20">
                <h4 className="text-2xl font-bold mb-4 text-secondary">{item.q}</h4>
                <p className="text-white/90 text-xl leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Footer Gelap Mirip Referensi Educourse */}
      <footer className="bg-[#0b0e14] text-white pt-24 pb-12 px-6">
        <div className="max-w-7xl mx-auto grid md:grid-cols-12 gap-16 border-b border-slate-800 pb-20">
          <div className="md:col-span-5">
            <div className="flex items-center gap-4 mb-8">
               <Image 
                src="/images/logo-edumainhealth.png" 
                alt="MainHealth Logo Footer" 
                width={70} 
                height={70} 
                className="brightness-110" 
              />
              <div className="flex flex-col">
                <h4 className="text-3xl font-black text-primary tracking-tighter leading-none">educourse</h4>
                <span className="text-[10px] font-bold text-slate-500 tracking-[0.2em] uppercase">— main health —</span>
              </div>
            </div>
            <p className="text-slate-400 text-lg leading-relaxed pr-10">
              Memberdayakan teknologi untuk kesejahteraan emosional yang lebih baik bagi seluruh masyarakat Indonesia. Kami hadir sebagai sahabat yang siap mendengarkan.
            </p>
          </div>

          <div className="md:col-span-3">
            <h5 className="text-xl font-bold mb-4">Navigasi</h5>
            <div className="w-12 h-1 bg-secondary mb-8"></div>
            <ul className="space-y-5 text-slate-400 text-lg">
              <li className="hover:text-primary transition cursor-pointer flex items-center group">
                <span className="text-secondary mr-2 group-hover:translate-x-1 transition-transform">›</span> Dashboard Anak
              </li>
              <li className="hover:text-primary transition cursor-pointer flex items-center group">
                <span className="text-secondary mr-2 group-hover:translate-x-1 transition-transform">›</span> Portal Orang Tua
              </li>
              <li className="hover:text-primary transition cursor-pointer flex items-center group">
                <span className="text-secondary mr-2 group-hover:translate-x-1 transition-transform">›</span> Layanan Psikolog
              </li>
            </ul>
          </div>

          <div className="md:col-span-4 text-lg">
            <h5 className="text-xl font-bold mb-4">Kontak Kami</h5>
            <div className="w-12 h-1 bg-primary mb-8"></div>
            <ul className="space-y-6 text-slate-400">
              <li className="flex items-start gap-4">
                <span className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">📍</span>
                <span>Intermark Indonesia Ruko 8, Tangerang Selatan, Banten 15310</span>
              </li>
              <li className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">📞</span>
                <span>+62 821-4391-0521</span>
              </li>
              <li className="flex items-center gap-4">
                <span className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center shrink-0 text-primary">✉️</span>
                <span className="text-primary font-bold">support@maleotech.com</span>
              </li>
            </ul>
          </div>
        </div>
        <div className="text-center pt-12 text-slate-500 text-sm tracking-[0.2em] font-bold uppercase">
          © 2026 PT. MALEO TEKNOLOGI INDONESIA. SELURUH HAK CIPTA DILINDUNGI.
        </div>
      </footer>
    </div>
  );
}