"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { 
  Heart, 
  ShieldAlert, 
  HelpCircle, 
  Send, 
  Loader2, 
  CheckCircle2,
  ChevronRight,
  ChevronLeft,
  Mail,
  Phone,
  School,
  GraduationCap,
  Sparkles
} from "lucide-react";

export default function WellBeingCampQuestionnairePage() {
  const { data: session } = useSession();
  const router = useRouter();

  const [testType, setTestType] = useState("post_test"); 
  const [isSubmitted, setIsSuccessSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [activeTab, setActiveTab] = useState("A"); 

  const [schools, setSchools] = useState([]);
  const [showSchoolDropdown, setShowSchoolDropdown] = useState(false);
  const [studentEmail, setStudentEmail] = useState("");
  const [studentWhatsapp, setStudentWhatsapp] = useState("");
  const [studentSchool, setStudentSchool] = useState("");
  const [studentClass, setStudentClass] = useState("");

  const [answersA, setAnswersA] = useState({});
  const [q16, setQ16] = useState([]);
  const [q16Others, setQ16Others] = useState("");
  const [q17, setQ17] = useState("");
  const [q18, setQ18] = useState("");
  const [q19, setQ19] = useState("");
  const [q20, setQ20] = useState([]);
  const [q20Others, setQ20Others] = useState("");
  const [q21, setQ21] = useState("");
  const [q22, setQ22] = useState("");
  const [q23, setQ23] = useState([]);
  const [q23Others, setQ23Others] = useState("");
  const [q24, setQ24] = useState([]);
  const [answersC, setAnswersC] = useState({
    q25: "", q26: "", q27: "", q28_target: "", q28_reason: "", q29: "", q30: ""
  });



  useEffect(() => {
    if (typeof window !== "undefined") {
      const savedEmail = localStorage.getItem("wb_camp_email");
      const savedWhatsapp = localStorage.getItem("wb_camp_whatsapp");
      const savedSchool = localStorage.getItem("wb_camp_school");
      const savedClass = localStorage.getItem("wb_camp_class");
      const savedAnswersA = localStorage.getItem("wb_camp_answersA");
      const savedQ16 = localStorage.getItem("wb_camp_q16");
      const savedQ16Others = localStorage.getItem("wb_camp_q16Others");
      const savedQ17 = localStorage.getItem("wb_camp_q17");
      const savedQ18 = localStorage.getItem("wb_camp_q18");
      const savedQ19 = localStorage.getItem("wb_camp_q19");
      const savedQ20 = localStorage.getItem("wb_camp_q20");
      const savedQ20Others = localStorage.getItem("wb_camp_q20Others");
      const savedQ21 = localStorage.getItem("wb_camp_q21");
      const savedQ22 = localStorage.getItem("wb_camp_q22");
      const savedQ23 = localStorage.getItem("wb_camp_q23");
      const savedQ23Others = localStorage.getItem("wb_camp_q23Others");
      const savedQ24 = localStorage.getItem("wb_camp_q24");
      const savedAnswersC = localStorage.getItem("wb_camp_answersC");

      if (savedEmail) setStudentEmail(savedEmail);
      if (savedWhatsapp) setStudentWhatsapp(savedWhatsapp);
      if (savedSchool) setStudentSchool(savedSchool);
      if (savedClass) setStudentClass(savedClass);
      if (savedAnswersA) setAnswersA(JSON.parse(savedAnswersA));
      if (savedQ16) setQ16(JSON.parse(savedQ16));
      if (savedQ16Others) setQ16Others(savedQ16Others);
      if (savedQ17) setQ17(savedQ17);
      if (savedQ18) setQ18(savedQ18);
      if (savedQ19) setQ19(savedQ19);
      if (savedQ20) setQ20(JSON.parse(savedQ20));
      if (savedQ20Others) setQ20Others(savedQ20Others);
      if (savedQ21) setQ21(savedQ21);
      if (savedQ22) setQ22(savedQ22);
      if (savedQ23) setQ23(JSON.parse(savedQ23));
      if (savedQ23Others) setQ23Others(savedQ23Others);
      if (savedQ24) setQ24(JSON.parse(savedQ24));
      if (savedAnswersC) setAnswersC(JSON.parse(savedAnswersC));
    }
    
    const fetchSchools = async () => {
      try {
        const res = await fetch("/api/signup/school?verified=true");
        const json = await res.json();
        if (json.success) {
          const makassarSchools = json.data.filter(s => 
            s.name.toLowerCase().includes("makassar") || 
            (s.address && s.address.toLowerCase().includes("makassar"))
          );
          const finalSchools = makassarSchools.length > 0 ? makassarSchools : json.data;
          finalSchools.sort((a, b) => a.name.localeCompare(b.name));
          setSchools(finalSchools);
        }
      } catch (e) {
        console.error(e);
      }
    };
    fetchSchools();
  }, []);

  useEffect(() => {
    localStorage.setItem("wb_camp_email", studentEmail);
  }, [studentEmail]);

  useEffect(() => {
    localStorage.setItem("wb_camp_whatsapp", studentWhatsapp);
  }, [studentWhatsapp]);

  useEffect(() => {
    localStorage.setItem("wb_camp_school", studentSchool);
  }, [studentSchool]);

  useEffect(() => {
    localStorage.setItem("wb_camp_class", studentClass);
  }, [studentClass]);

  useEffect(() => {
    localStorage.setItem("wb_camp_answersA", JSON.stringify(answersA));
  }, [answersA]);

  useEffect(() => {
    localStorage.setItem("wb_camp_q16", JSON.stringify(q16));
  }, [q16]);

  useEffect(() => {
    localStorage.setItem("wb_camp_q16Others", q16Others);
  }, [q16Others]);

  useEffect(() => {
    localStorage.setItem("wb_camp_q17", q17);
  }, [q17]);

  useEffect(() => {
    localStorage.setItem("wb_camp_q18", q18);
  }, [q18]);

  useEffect(() => {
    localStorage.setItem("wb_camp_q19", q19);
  }, [q19]);

  useEffect(() => {
    localStorage.setItem("wb_camp_q20", JSON.stringify(q20));
  }, [q20]);

  useEffect(() => {
    localStorage.setItem("wb_camp_q20Others", q20Others);
  }, [q20Others]);

  useEffect(() => {
    localStorage.setItem("wb_camp_q21", q21);
  }, [q21]);

  useEffect(() => {
    localStorage.setItem("wb_camp_q22", q22);
  }, [q22]);

  useEffect(() => {
    localStorage.setItem("wb_camp_q23", JSON.stringify(q23));
  }, [q23]);

  useEffect(() => {
    localStorage.setItem("wb_camp_q23Others", q23Others);
  }, [q23Others]);

  useEffect(() => {
    localStorage.setItem("wb_camp_q24", JSON.stringify(q24));
  }, [q24]);

  useEffect(() => {
    localStorage.setItem("wb_camp_answersC", JSON.stringify(answersC));
  }, [answersC]);

  const scaleOptions = [
    { value: "1", label: "Tidak Pernah" },
    { value: "2", label: "Jarang" },
    { value: "3", label: "Kadang-kadang" },
    { value: "4", label: "Sering" },
    { value: "5", label: "Sangat Sering" }
  ];

  const partAQuestions = [
    { id: 1, text: "Saya merasa sedih tanpa alasan yang jelas." },
    { id: 2, text: "Saya merasa sulit menikmati hal-hal yang biasanya saya sukai." },
    { id: 3, text: "Saya merasa tertekan oleh berbagai masalah yang saya hadapi." },
    { id: 4, text: "Saya merasa kewalahan menghadapi tuntutan sekolah atau kehidupan sehari-hari." },
    { id: 5, text: "Saya sering merasa khawatir berlebihan tentang sesuatu." },
    { id: 6, text: "Saya sulit berhenti memikirkan masalah yang sedang saya hadapi." },
    { id: 7, text: "Saya merasa gugup atau cemas menghadapi situasi sehari-hari." },
    { id: 8, text: "Saya merasa sendirian meskipun berada di sekitar banyak orang." },
    { id: 9, text: "Saya merasa tidak memiliki teman yang benar-benar memahami saya." },
    { id: 10, text: "Saya merasa sulit menemukan seseorang yang bisa diajak bicara ketika sedang memiliki masalah." },
    { id: 11, text: "Ketika marah atau sedih, saya mampu menenangkan diri dengan cara yang sehat." },
    { id: 12, text: "Saya dapat mengenali emosi yang sedang saya rasakan" },
    { id: 13, text: "Saya dapat mengendalikan diri ketika menghadapi situasi yang membuat saya kesal." },
    { id: 14, text: "Jika mengalami masalah serius, saya bersedia mencari bantuan." },
    { id: 15, text: "Saya tahu kepada siapa harus meminta bantuan ketika menghadapi masalah emosional." }
  ];

  const q16Options = ["Orang tua", "Saudara", "Teman", "Guru/Wali Kelas", "Guru BK", "Psikolog/Konselor", "Tokoh agama", "Tidak ada", "Lainnya"];
  const q18Options = ["Tidak Pernah", "Pernah 1-2 kali", "Kadang-kadang (dalam 3 bulan terakhir, pernah dibully)", "Sering (per minggu 1x)", "Sangat Sering (hampir setiap hari)"];
  const q19Options = ["Tidak Pernah", "Pernah 1-2 kali", "Kadang-kadang", "Sering", "Sangat Sering"];
  const q20Options = ["Diejek atau dihina", "Diberi julukan yang menyakitkan", "Dikucilkan dari kelompok", "Disebarkan gosip", "Diancam", "Kekerasan fisik", "Body shaming", "Bullying terkait prestasi/nilai", "Bullying di media sosial", "Lainnya"];
  const freqOptions = ["Tidak Pernah", "1 kali", "2-3 kali", "4-5 kali", "Lebih dari 5 kali"];
  const q23Options = ["WhatsApp", "Instagram", "Tik Tok", "Facebook", "Game Online", "Discord", "X/Twitter", "Lainnya"];
  const q24Options = ["Diam saja", "Menghindar", "Membalas", "Cerita ke teman", "Cerita ke orang tua", "Cerita ke guru", "Melapor ke sekolah", "Mencari bantuan profesional", "Tidak tahu harus berbuat apa"];

  const handleCheckboxChange = (value, state, setState) => {
    if (state.includes(value)) {
      setState(state.filter((item) => item !== value));
    } else {
      setState([...state, value]);
    }
  };

  const clearLocalStorageCache = () => {
    localStorage.removeItem("wb_camp_email");
    localStorage.removeItem("wb_camp_whatsapp");
    localStorage.removeItem("wb_camp_school");
    localStorage.removeItem("wb_camp_class");
    localStorage.removeItem("wb_camp_answersA");
    localStorage.removeItem("wb_camp_q16");
    localStorage.removeItem("wb_camp_q16Others");
    localStorage.removeItem("wb_camp_q17");
    localStorage.removeItem("wb_camp_q18");
    localStorage.removeItem("wb_camp_q19");
    localStorage.removeItem("wb_camp_q20");
    localStorage.removeItem("wb_camp_q20Others");
    localStorage.removeItem("wb_camp_q21");
    localStorage.removeItem("wb_camp_q22");
    localStorage.removeItem("wb_camp_q23");
    localStorage.removeItem("wb_camp_q23Others");
    localStorage.removeItem("wb_camp_q24");
    localStorage.removeItem("wb_camp_answersC");
  };

  const validatePart = (part) => {
    if (part === "A") {
      if (!studentEmail.trim() || !studentWhatsapp.trim() || !studentSchool.trim() || !studentClass.trim()) {
        alert("Harap lengkapi data diri (Email, WhatsApp, Sekolah, Kelas) terlebih dahulu.");
        return false;
      }
      if (Object.keys(answersA).length < 15) {
        alert("Harap isi semua pertanyaan (1-15) di Bagian A.");
        return false;
      }
      if (q16.length === 0) {
        alert("Harap pilih setidaknya satu orang yang paling mungkin diajak bicara pada soal no 16.");
        return false;
      }
      if (q16.includes("Lainnya") && !q16Others.trim()) {
        alert("Harap sebutkan orang lainnya pada soal no 16.");
        return false;
      }
      if (!q17.trim()) {
        alert("Harap isi pandangan Anda pada soal no 17.");
        return false;
      }
      return true;
    }
    if (part === "B") {
      if (!q18) {
        alert("Harap jawab pertanyaan no 18.");
        return false;
      }
      if (!q19) {
        alert("Harap jawab pertanyaan no 19.");
        return false;
      }
      if (q20.length === 0) {
        alert("Harap jawab pertanyaan no 20.");
        return false;
      }
      if (q20.includes("Lainnya") && !q20Others.trim()) {
        alert("Harap sebutkan bentuk bullying lainnya pada soal no 20.");
        return false;
      }
      if (!q21) {
        alert("Harap jawab pertanyaan no 21.");
        return false;
      }
      if (!q22) {
        alert("Harap jawab pertanyaan no 22.");
        return false;
      }
      if (q23.length === 0) {
        alert("Harap jawab pertanyaan no 23.");
        return false;
      }
      if (q23.includes("Lainnya") && !q23Others.trim()) {
        alert("Harap sebutkan platform lainnya pada soal no 23.");
        return false;
      }
      if (q24.length === 0) {
        alert("Harap jawab pertanyaan no 24.");
        return false;
      }
      return true;
    }
    if (part === "C") {
      if (!answersC.q25?.trim() || !answersC.q26?.trim() || !answersC.q27?.trim() || !answersC.q28_target?.trim() || !answersC.q28_reason?.trim() || !answersC.q29?.trim() || !answersC.q30?.trim()) {
        alert("Harap isi semua pertanyaan esai di Bagian C.");
        return false;
      }
      return true;
    }
    return true;
  };

  const handleTabChange = (targetTab) => {
    // Validasi sebelum pindah tab ke kanan
    if (targetTab === "B") {
      if (!validatePart("A")) return;
    } else if (targetTab === "C") {
      if (!validatePart("A") || !validatePart("B")) return;
    }
    setActiveTab(targetTab);
  };

  const handleFormSubmit = async (e) => {
    e.preventDefault();

    if (!validatePart("A")) { setActiveTab("A"); return; }
    if (!validatePart("B")) { setActiveTab("B"); return; }
    if (!validatePart("C")) { setActiveTab("C"); return; }

    setSubmitting(true);

    const payload = {
      student_id: session?.user?.id || null,
      assessment_type: testType,
      timestamp: new Date(),
      metadata: {
        email: studentEmail.toLowerCase().trim(),
        whatsapp: studentWhatsapp.trim(),
        school_name: studentSchool,
        student_class: studentClass
      },
      part_A: {
        scaled_metrics: answersA,
        most_likely_confidant: q16,
        most_likely_confidant_others: q16.includes("Lainnya") ? q16Others : "",
        biggest_teen_challenge: q17
      },
      part_B: {
        experienced_bullying: q18,
        perpetrated_bullying: q19,
        bullying_types_suffered: q20,
        bullying_types_suffered_others: q20.includes("Lainnya") ? q20Others : "",
        school_bullying_frequency_weekly: q21,
        cyberbullying_frequency_weekly: q22,
        cyberbullying_platforms: q23,
        cyberbullying_platforms_others: q23.includes("Lainnya") ? q23Others : "",
        victim_coping_mechanism: q24
      },
      part_C: {
        bullying_vs_conflict_definition: answersC.q25,
        emotional_distress_signs_bystander: answersC.q26,
        bystander_intervention_action: answersC.q27,
        help_seeking_target: answersC.q28_target,
        help_seeking_reason: answersC.q28_reason,
        victim_silence_reason: answersC.q29,
        school_safe_environment_recommendation: answersC.q30
      }
    };

    try {
      await fetch("/api/kuisoner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      await new Promise((resolve) => setTimeout(resolve, 1500));
      clearLocalStorageCache();
      setIsSuccessSubmitted(true);
    } catch (err) {
      console.error(err);
      alert("Terjadi kesalahan jaringan.");
    } finally {
      setSubmitting(false);
    }
  };

  if (isSubmitted) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4 font-sans selection:bg-[#00adb5] selection:text-white">
        <div className="bg-white p-8 md:p-14 rounded-[35px] md:rounded-[45px] max-w-xl w-full shadow-2xl text-center border border-slate-100 relative overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-2 bg-emerald-500"></div>
          <div className="w-20 h-20 md:w-24 md:h-24 bg-emerald-50 text-emerald-500 rounded-2xl md:rounded-3xl flex items-center justify-center mx-auto mb-6 md:mb-8 border border-emerald-100">
            <CheckCircle2 className="w-10 h-10 md:w-12 md:h-12" />
          </div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">{testType === "pre_test" ? "Pretest" : "Postest"} Berhasil Dikirim!</h2>
          <p className="text-slate-500 font-bold text-sm mt-4 leading-relaxed text-emerald-600 bg-emerald-50/50 py-3 px-5 rounded-2xl border border-emerald-100/40">
            Riwayat isian Anda telah dikirimkan ke alamat email.
          </p>
          <p className="text-slate-400 font-medium text-xs mt-3 leading-relaxed italic">
            Terima kasih banyak atas kejujuranmu. Jawabanmu sangat berharga dalam membantu kami menciptakan lingkungan sekolah yang lebih aman, nyaman, dan suportif.
          </p>
          <div className="mt-8 md:mt-10">
            <button onClick={() => router.push("/")} className="w-full h-14 bg-[#0b0e14] text-white rounded-[20px] font-bold text-xs uppercase tracking-widest hover:bg-[#00adb5] transition-all shadow-xl">
              Kembali ke Home Page
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans selection:bg-[#00adb5] selection:text-white pb-24">
      <nav className="fixed w-full bg-white/80 backdrop-blur-xl z-50 border-b border-slate-100 px-4 md:px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4 sm:gap-0">
        <div className="flex items-center gap-3 self-start sm:self-center">
          <Image src="/images/telkom-indonesia.png" alt="Telkom Indonesia" width={60} height={30} className="h-6 w-auto" />
          <Image src="/images/tjsl.png" alt="TJSL" width={60} height={30} className="h-6 w-auto" />
          <div className="w-px h-6 bg-slate-200 hidden sm:block"></div>
          <div className="flex flex-col sm:ml-1">
            <span className="text-base md:text-lg font-black text-navy-deep leading-none tracking-tighter uppercase">EduMind</span>
            <span className="text-[8px] md:text-[9px] font-bold text-slate-400 tracking-[0.2em] uppercase">Wellbeing Camp Bukittinggi</span>
          </div>
        </div>
        
        <div className="bg-slate-100 p-1 rounded-2xl flex gap-1 border border-slate-200 w-full sm:w-auto overflow-x-auto shrink-0">
          <button 
            type="button"
            className="flex-1 sm:flex-none text-center px-3 md:px-4 py-2.5 rounded-xl text-[9px] md:text-[10px] font-black uppercase tracking-wider transition-all whitespace-nowrap bg-[#00adb5] text-white shadow-md cursor-default"
          >
            🚀 {testType === "pre_test" ? "Pre-Test" : "Post-Test"}
          </button>
        </div>
      </nav>

      <div className="max-w-4xl mx-auto pt-44 sm:pt-32 px-4">
        <header className="bg-white border border-slate-100 rounded-[28px] md:rounded-[35px] p-6 md:p-10 shadow-sm mb-6 relative">
          <div className={`absolute top-0 left-0 right-0 h-2 rounded-t-[28px] md:rounded-t-[35px] ${testType === "pre_test" ? "bg-slate-900" : "bg-[#00adb5]"}`}></div>
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[9px] md:text-[10px] font-black uppercase tracking-widest ${testType === "pre_test" ? "bg-slate-100 text-slate-800" : "bg-[#00adb5]/10 text-[#00adb5]"}`}>
                {testType === "pre_test" ? "Phase 1: Pre-Camp Assessment" : "Phase 2: Post-Camp Evaluation"}
              </span>
              <h1 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight leading-tight">{testType === "pre_test" ? "Pretest" : "Postest"} Pengalaman & Kesehatan Mental Remaja</h1>
              <p className="text-xs text-slate-400 leading-relaxed font-medium italic">
                {testType === "pre_test" ? "Pretest" : "Postest"} ini bukan ujian dan tidak ada jawaban benar atau salah. Jawabanmu dijamin rahasia & tidak memengaruhi nilai sekolah. Isilah sejujur-jujurnya.
              </p>
            </div>
            <div className="text-center p-4 bg-slate-50 border border-slate-100 rounded-2xl shrink-0 lg:w-44">
              <span className="block text-[9px] md:text-[10px] font-black text-slate-400 uppercase tracking-widest">Status Pengisian</span>
              <span className="block text-xl md:text-2xl font-black text-slate-800 mt-1">
                {Object.keys(answersA).length + (q16.length > 0 ? 1 : 0) + (q17 ? 1 : 0) + (q18 ? 1 : 0) + (q19 ? 1 : 0) + (q21 ? 1 : 0) + (q22 ? 1 : 0)} / 22
              </span>
              <span className="block text-[9px] text-[#00adb5] font-bold mt-1">Instrumen Terisi</span>
            </div>
          </div>

          {/* ── SEKTOR UPDATE: MENYISIPKAN NARASI SAMBUTAN PEMBUKA RESMI KUESIONER ── */}
          <div className="mt-6 p-5 md:p-6 bg-gradient-to-br from-slate-50 to-slate-100/50 border border-slate-200/60 rounded-2xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#00adb5]/5 rounded-full blur-xl pointer-events-none transition-all group-hover:scale-150"></div>
            <div className="flex items-center gap-2 text-[#00adb5] mb-2.5">
              <Sparkles size={16} className="animate-pulse" />
              <h4 className="text-xs font-black uppercase tracking-widest">Hai, Teman-Teman!</h4>
            </div>
            <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed [text-shadow:_0_0_1px_rgba(241,245,249,0.1)]">
              Sebelum memulai, kami ingin mengucapkan terima kasih karena sudah meluangkan waktu untuk mengisi {testType === "pre_test" ? "pretest" : "postest"} ini. {testType === "pre_test" ? "Pretest" : "Postest"} ini bukan ujian dan tidak ada jawaban benar atau salah. Kami hanya ingin mengetahui bagaimana pengalaman, perasaan, dan pandangan kalian tentang kehidupan sebagai remaja saat ini, termasuk tentang pertemanan, bullying, media sosial, dan kesehatan mental.
            </p>
            <p className="text-xs md:text-sm text-slate-600 font-medium leading-relaxed mt-2.5">
              Jangan khawatir, semua jawaban yang kamu berikan akan dirahasiakan dan tidak akan memengaruhi nilai maupun statusmu di sekolah. Karena itu, isilah sesuai dengan kondisi dan pengalaman yang sebenarnya. Semakin jujur jawaban yang diberikan, semakin membantu kami memahami kebutuhan remaja dan menciptakan lingkungan sekolah yang lebih aman, nyaman, dan suportif bagi semua.
            </p>
          </div>

          <div className="mt-6 pt-6 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase ml-1">Alamat Email Aktif</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                  type="email"
                  required
                  value={studentEmail}
                  onChange={(e) => setStudentEmail(e.target.value)}
                  placeholder="contoh@sekolah.com"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-[#00adb5] focus:bg-white rounded-xl outline-none text-xs font-bold transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase ml-1">No. WhatsApp Aktif</label>
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                  type="tel"
                  required
                  value={studentWhatsapp}
                  onChange={(e) => setStudentWhatsapp(e.target.value)}
                  placeholder="08xxxxxxxxxx"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-[#00adb5] focus:bg-white rounded-xl outline-none text-xs font-bold transition-all shadow-inner"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase ml-1">Nama Asal Sekolah</label>
              <div className="relative">
                <School className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                {schools.length > 0 ? (
                  <div className="relative w-full">
                    <input
                      type="text"
                      required
                      value={studentSchool}
                      onChange={(e) => {
                        setStudentSchool(e.target.value);
                        setShowSchoolDropdown(true);
                      }}
                      onFocus={(e) => {
                        setShowSchoolDropdown(true);
                        e.target.select();
                      }}
                      onBlur={() => {
                        setTimeout(() => setShowSchoolDropdown(false), 200);
                      }}
                      placeholder="Cari nama sekolah..."
                      className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-[#00adb5] focus:bg-white rounded-xl outline-none text-xs font-black transition-all shadow-inner tracking-wide"
                    />
                    {showSchoolDropdown && (
                      <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-xl shadow-2xl max-h-72 overflow-y-auto">
                        {schools
                          .filter((s) => s.name.toLowerCase().includes(studentSchool.toLowerCase()))
                          .map((s) => (
                            <div
                              key={s._id}
                              className="px-4 py-3 hover:bg-slate-50 cursor-pointer text-xs font-bold text-slate-700 border-b border-slate-100 last:border-none"
                              onMouseDown={(e) => {
                                e.preventDefault();
                                setStudentSchool(s.name);
                                setShowSchoolDropdown(false);
                              }}
                            >
                              {s.name}
                            </div>
                          ))}
                        {schools.filter((s) => s.name.toLowerCase().includes(studentSchool.toLowerCase())).length === 0 && (
                          <div className="px-4 py-3 text-xs font-bold text-slate-400 text-center">
                            Sekolah tidak ditemukan di wilayah Makassar
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <input
                    type="text"
                    required
                    value={studentSchool}
                    onChange={(e) => setStudentSchool(e.target.value.toUpperCase())}
                    placeholder="SMAN 1 MAKASSAR"
                    className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-[#00adb5] focus:bg-white rounded-xl outline-none text-xs font-black transition-all shadow-inner tracking-wide"
                  />
                )}
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-[11px] font-black text-slate-500 uppercase ml-1">Kelas / Rombel</label>
              <div className="relative">
                <GraduationCap className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300" size={16} />
                <input
                  type="text"
                  required
                  value={studentClass}
                  onChange={(e) => setStudentClass(e.target.value.toUpperCase())}
                  placeholder="XI MIPA 3"
                  className="w-full pl-11 pr-4 py-3.5 bg-slate-50 border border-slate-200 focus:border-[#00adb5] focus:bg-white rounded-xl outline-none text-xs font-black transition-all shadow-inner tracking-wide"
                />
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-2 mt-6 md:mt-8 pt-6 md:pt-8 border-t border-slate-100 text-center">
            <button type="button" onClick={() => handleTabChange("A")} className={`flex-1 py-3 md:py-3.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest border transition-all ${activeTab === "A" ? "bg-[#00adb5] text-white border-transparent shadow-md shadow-[#00adb5]/10" : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"}`}>
              Bagian A: Well-Being
            </button>
            <button type="button" onClick={() => handleTabChange("B")} className={`flex-1 py-3 md:py-3.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest border transition-all ${activeTab === "B" ? "bg-[#00adb5] text-white border-transparent shadow-md shadow-[#00adb5]/10" : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"}`}>
              Bagian B: Bullying
            </button>
            <button type="button" onClick={() => handleTabChange("C")} className={`flex-1 py-3 md:py-3.5 rounded-xl text-[10px] md:text-xs font-black uppercase tracking-widest border transition-all ${activeTab === "C" ? "bg-[#00adb5] text-white border-transparent shadow-md shadow-[#00adb5]/10" : "bg-white text-slate-400 border-slate-200 hover:bg-slate-50"}`}>
              Bagian C: Pemahaman
            </button>
          </div>
        </header>

        <form onSubmit={handleFormSubmit}>
          {activeTab === "A" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-gradient-to-r from-[#00adb5]/5 to-sky-50 border border-[#00adb5]/10 rounded-2xl p-4 md:p-5 flex items-start gap-4">
                <Heart className="text-[#00adb5] shrink-0 mt-0.5 w-5 h-5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Petunjuk Bagian A</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium mt-1">
                    Jawablah pertanyaan nomor 1-15 dengan memilih angka skala 1-5 yang paling menggambarkan kondisi atau pengalaman yang kamu rasakan akhir-akhir ini.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-[28px] md:rounded-[35px] overflow-hidden shadow-sm">
                <div className="p-4 bg-slate-50/50 border-b border-slate-100 flex flex-col gap-4">
                  <div className="flex items-center justify-between text-[10px] md:text-[11px] font-black uppercase tracking-wider text-slate-400">
                    <span>Butir {testType === "pre_test" ? "Pretest" : "Postest"} Evaluasi 1 - 15</span>
                    <span className="text-[#00adb5] bg-[#00adb5]/10 px-2.5 py-1 rounded-md">[PILIHAN TUNGGAL]</span>
                  </div>
                  
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2 text-[9px] md:text-[10px] font-black uppercase tracking-wider text-slate-400 text-center pt-1 border-t border-slate-100/70">
                    {scaleOptions.map((opt) => (
                      <div key={opt.value} className="bg-white border border-slate-200/50 p-2 rounded-xl shadow-inner flex items-center justify-center gap-1.5 sm:flex-col sm:gap-0.5">
                        <span className="text-[#00adb5] text-xs font-black">{opt.value} =</span>
                        <span className="text-slate-500 font-bold truncate">{opt.label}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="hidden md:block overflow-x-auto">
                  <table className="w-full border-collapse text-left min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-50/30 border-b border-slate-100 text-xs font-black uppercase tracking-wider text-slate-400">
                        <th className="py-5 px-6 w-12 text-center">No</th>
                        <th className="py-5 px-6">Butir Pertanyaan {testType === "pre_test" ? "Pretest" : "Postest"}</th>
                        <th className="py-5 px-6 text-center w-80">Skala Penilaian (1 - 5)</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {partAQuestions.map((q) => (
                        <tr key={q.id} className="hover:bg-slate-50/40 transition-colors">
                          <td className="py-5 px-6 text-sm font-black text-slate-400 text-center">{q.id}</td>
                          <td className="py-5 px-6 text-sm font-bold text-slate-700 leading-relaxed">{q.text}</td>
                          <td className="py-5 px-6">
                            <div className="flex justify-between items-center gap-1 max-w-[280px] mx-auto">
                              {[1, 2, 3, 4, 5].map((num) => {
                                const isSelected = answersA[q.id] === String(num);
                                return (
                                  <button
                                    key={num}
                                    type="button"
                                    onClick={() => setAnswersA({ ...answersA, [q.id]: String(num) })}
                                    className={`w-10 h-10 rounded-xl text-xs font-black transition-all border ${isSelected ? "bg-[#00adb5] text-white border-transparent scale-110 shadow-md shadow-[#00adb5]/20" : "bg-white text-slate-400 border-slate-200 hover:border-[#00adb5]/30 hover:text-slate-700"}`}
                                  >
                                    {num}
                                  </button>
                                );
                              })}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="block md:hidden divide-y divide-slate-100 px-4">
                  {partAQuestions.map((q) => (
                    <div key={q.id} className="py-5 space-y-3">
                      <div className="flex gap-2 items-start">
                        <span className="text-xs font-black text-[#00adb5] bg-[#00adb5]/10 w-6 h-6 rounded-lg flex items-center justify-center shrink-0 mt-0.5">{q.id}</span>
                        <p className="text-sm font-bold text-slate-700 leading-relaxed">{q.text}</p>
                      </div>
                      <div className="grid grid-cols-5 gap-1.5 pt-1">
                        {[1, 2, 3, 4, 5].map((num) => {
                          const isSelected = answersA[q.id] === String(num);
                          return (
                            <button
                              key={num}
                              type="button"
                              onClick={() => setAnswersA({ ...answersA, [q.id]: String(num) })}
                              className={`h-11 rounded-xl text-xs font-black transition-all border flex flex-col items-center justify-center gap-0.5 ${isSelected ? "bg-[#00adb5] text-white border-transparent shadow-md shadow-[#00adb5]/10" : "bg-slate-50/50 text-slate-400 border-slate-200"}`}
                            >
                              <span className="text-xs leading-none">{num}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-[28px] md:rounded-[35px] p-6 md:p-8 shadow-sm space-y-6">
                <div className="space-y-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-slate-50 pb-3 gap-2">
                    <label className="text-sm font-black text-slate-800 leading-snug">16. Jika sedang mengalami masalah berat, siapa orang yang PALING mungkin Anda ajak bicara?</label>
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-md shrink-0 w-fit">[BISA PILIH BEBERAPA]</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-4 gap-2.5">
                    {q16Options.map((opt) => {
                      const isChecked = q16.includes(opt);
                      return (
                        <button
                          key={opt}
                          type="button"
                          onClick={() => handleCheckboxChange(opt, q16, setQ16)}
                          className={`p-4 rounded-xl border text-xs font-bold transition-all flex items-center justify-start sm:justify-center gap-2.5 text-left sm:text-center h-full ${isChecked ? "bg-slate-900 text-white border-transparent shadow-md" : "bg-slate-50/50 border-slate-200/70 text-slate-600 hover:bg-white hover:border-[#00adb5]/30"}`}
                        >
                          <input 
                            type="checkbox" 
                            checked={isChecked} 
                            readOnly 
                            className="w-3.5 h-3.5 accent-[#00adb5] rounded pointer-events-none shrink-0" 
                          />
                          <span>{opt}</span>
                        </button>
                      );
                    })}
                  </div>

                  {q16.includes("Lainnya") && (
                    <div className="pt-2 animate-in slide-in-from-top-2 duration-200">
                      <input
                        type="text"
                        value={q16Others}
                        onChange={(e) => setQ16Others(e.target.value)}
                        placeholder="Sebutkan orang lain yang paling mungkin Anda ajak bicara disini..."
                        className="w-full p-4 bg-slate-50 border-2 border-[#00adb5]/20 focus:border-[#00adb5] focus:bg-white rounded-xl outline-none text-xs font-bold transition-all shadow-inner"
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <label className="text-sm font-black text-slate-800">17. Menurut Anda, apa tantangan terbesar yang dihadapi remaja saat ini?</label>
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wider text-amber-500 bg-amber-50 px-2.5 py-1 rounded-md shrink-0 ml-4">[JAWABAN ESAI]</span>
                  </div>
                  <textarea
                    value={q17}
                    onChange={(e) => setQ17(e.target.value)}
                    placeholder="Tuliskan pandanganmu secara terbuka disini..."
                    rows={4}
                    className="w-full p-4 md:p-5 bg-slate-50 border-2 border-transparent focus:border-[#00adb5]/20 focus:bg-white rounded-[22px] outline-none text-sm font-semibold leading-relaxed transition-all shadow-inner"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-4">
                <button type="button" onClick={() => handleTabChange("B")} className="w-full sm:w-auto h-14 px-8 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded-2xl flex items-center justify-center gap-2 hover:bg-[#00adb5] transition-all shadow-md">
                  Lanjut ke Bagian B <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {activeTab === "B" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-gradient-to-r from-rose-50 to-orange-50 border border-rose-100 rounded-2xl p-4 md:p-5 flex items-start gap-4">
                <ShieldAlert className="text-rose-500 shrink-0 mt-0.5 w-5 h-5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Petunjuk Bagian B</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium mt-1">
                    Bagian ini mengukur intensitas dan paparan insiden perundungan (bullying) di lingkungan sekolah maupun media sosial dalam kurun waktu belakangan ini.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-[28px] md:rounded-[35px] p-6 md:p-8 shadow-sm space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <label className="text-sm font-black text-slate-800">18. Dalam 6 bulan terakhir, apakah Anda pernah mengalami bullying?</label>
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wider text-[#00adb5] bg-[#00adb5]/10 px-2.5 py-1 rounded-md shrink-0 ml-4">[PILIHAN TUNGGAL]</span>
                  </div>
                  <div className="space-y-2">
                    {q18Options.map((opt) => (
                      <label key={opt} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${q18 === opt ? "bg-[#00adb5]/5 border-[#00adb5]/30 font-bold text-slate-800" : "bg-slate-50/40 border-transparent text-slate-600 hover:bg-slate-50"}`}>
                        <input type="radio" name="q18" checked={q18 === opt} onChange={() => setQ18(opt)} className="accent-[#00adb5] w-4 h-4 shrink-0" />
                        <span className="text-xs leading-relaxed">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <label className="text-sm font-black text-slate-800">19. Dalam 6 bulan terakhir, apakah Anda pernah melakukan bullying kepada orang lain?</label>
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wider text-[#00adb5] bg-[#00adb5]/10 px-2.5 py-1 rounded-md shrink-0 ml-4">[PILIHAN TUNGGAL]</span>
                  </div>
                  <div className="space-y-2">
                    {q19Options.map((opt) => (
                      <label key={opt} className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all ${q19 === opt ? "bg-[#00adb5]/5 border-[#00adb5]/30 font-bold text-slate-800" : "bg-slate-50/40 border-transparent text-slate-600 hover:bg-slate-50"}`}>
                        <input type="radio" name="q19" checked={q19 === opt} onChange={() => setQ19(opt)} className="accent-[#00adb5] w-4 h-4 shrink-0" />
                        <span className="text-xs leading-relaxed">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <label className="text-sm font-black text-slate-800">20. Jika pernah mengalami bullying, bentuk yang paling sering Anda alami adalah:</label>
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-md shrink-0 ml-4">[BISA PILIH BEBERAPA]</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {q20Options.map((opt) => {
                      const isChecked = q20.includes(opt);
                      return (
                        <div key={opt} className="flex flex-col gap-2">
                          <label className={`flex items-center gap-4 p-4 rounded-xl border cursor-pointer transition-all h-full ${isChecked ? "bg-slate-900 border-transparent text-white font-bold" : "bg-slate-50/50 border-slate-200/60 text-slate-600 hover:bg-slate-50"}`}>
                            <input type="checkbox" checked={isChecked} onChange={() => handleCheckboxChange(opt, q20, setQ20)} className="w-4 h-4 accent-[#00adb5] rounded shrink-0" />
                            <span className="text-xs">{opt}</span>
                          </label>
                        </div>
                      );
                    })}
                  </div>

                  {q20.includes("Lainnya") && (
                    <div className="pt-2 animate-in slide-in-from-top-2 duration-200">
                      <input
                        type="text"
                        value={q20Others}
                        onChange={(e) => setQ20Others(e.target.value)}
                        placeholder="Sebutkan bentuk bullying lainnya yang Anda alami disini..."
                        className="w-full p-4 bg-slate-50 border-2 border-[#00adb5]/20 focus:border-[#00adb5] focus:bg-white rounded-xl outline-none text-xs font-bold transition-all shadow-inner"
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <label className="text-sm font-black text-slate-800">21. Dalam satu minggu terakhir, seberapa sering Anda mengalami atau melihat bullying di sekolah?</label>
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wider text-[#00adb5] bg-[#00adb5]/10 px-2.5 py-1 rounded-md shrink-0 ml-4">[PILIHAN TUNGGAL]</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {freqOptions.map((opt) => (
                      <label key={opt} className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center cursor-pointer transition-all min-h-[90px] ${q21 === opt ? "bg-[#00adb5] text-white border-transparent font-bold shadow-md shadow-[#00adb5]/20" : "bg-slate-50/50 border-slate-200/60 text-slate-600 hover:bg-white hover:border-[#00adb5]/30"}`}>
                        <input type="radio" name="q21" checked={q21 === opt} onChange={() => setQ21(opt)} className="accent-[#00adb5] w-4 h-4 mb-3" />
                        <span className="text-[11px] leading-tight">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <label className="text-sm font-black text-slate-800">22. Dalam satu minggu terakhir, seberapa sering Anda mengalami atau melihat cyberbullying?</label>
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wider text-[#00adb5] bg-[#00adb5]/10 px-2.5 py-1 rounded-md shrink-0 ml-4">[PILIHAN TUNGGAL]</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
                    {freqOptions.map((opt) => (
                      <label key={opt} className={`flex flex-col items-center justify-center p-4 rounded-xl border text-center cursor-pointer transition-all min-h-[90px] ${q22 === opt ? "bg-[#00adb5] text-white border-transparent font-bold shadow-md shadow-[#00adb5]/20" : "bg-slate-50/50 border-slate-200/60 text-slate-600 hover:bg-white hover:border-[#00adb5]/30"}`}>
                        <input type="radio" name="q22" checked={q22 === opt} onChange={() => setQ22(opt)} className="accent-[#00adb5] w-4 h-4 mb-3" />
                        <span className="text-[11px] leading-tight">{opt}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <label className="text-sm font-black text-slate-800">23. Menurut Anda, di mana cyberbullying paling sering terjadi?</label>
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-md shrink-0 ml-4">[BISA PILIH BEBERAPA]</span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {q23Options.map((opt) => {
                      const isChecked = q23.includes(opt);
                      return (
                        <label key={opt} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isChecked ? "bg-slate-900 border-transparent text-white font-bold" : "bg-slate-50/50 border-slate-200/60 text-slate-600 hover:bg-white hover:border-[#00adb5]/30"}`}>
                          <input type="checkbox" checked={isChecked} onChange={() => handleCheckboxChange(opt, q23, setQ23)} className="w-4 h-4 accent-[#00adb5] rounded shrink-0" />
                          <span className="text-xs">{opt}</span>
                        </label>
                      );
                    })}
                  </div>

                  {q23.includes("Lainnya") && (
                    <div className="pt-2 animate-in slide-in-from-top-2 duration-200">
                      <input
                        type="text"
                        value={q23Others}
                        onChange={(e) => setQ23Others(e.target.value)}
                        placeholder="Sebutkan platform media sosial/game lainnya disini..."
                        className="w-full p-4 bg-slate-50 border-2 border-[#00adb5]/20 focus:border-[#00adb5] focus:bg-white rounded-xl outline-none text-xs font-bold transition-all shadow-inner"
                        required
                      />
                    </div>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <label className="text-sm font-black text-slate-800">24. Jika Anda pernah mengalami bullying, apa yang biasanya Anda lakukan?</label>
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wider text-indigo-500 bg-indigo-50 px-2.5 py-1 rounded-md shrink-0 ml-4">[BISA PILIH BEBERAPA]</span>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                    {q24Options.map((opt) => {
                      const isChecked = q24.includes(opt);
                      return (
                        <label key={opt} className={`flex items-center gap-3 p-4 rounded-xl border cursor-pointer transition-all ${isChecked ? "bg-[#00adb5]/10 border-[#00adb5]/40 text-[#00adb5] font-bold" : "bg-slate-50/50 border-slate-200/60 text-slate-600 hover:bg-white hover:border-[#00adb5]/30"}`}>
                          <input type="checkbox" checked={isChecked} onChange={() => handleCheckboxChange(opt, q24, setQ24)} className="w-4 h-4 accent-[#00adb5] rounded shrink-0" />
                          <span className="text-xs">{opt}</span>
                        </label>
                      );
                    })}
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
                <button type="button" onClick={() => handleTabChange("A")} className="w-full sm:w-auto h-14 px-8 bg-white text-slate-700 font-bold text-xs uppercase tracking-widest rounded-2xl border border-slate-200 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                  <ChevronLeft size={16} /> Kembali ke Bagian A
                </button>
                <button type="button" onClick={() => handleTabChange("C")} className="w-full sm:w-auto h-14 px-8 bg-slate-900 text-white font-bold text-xs uppercase tracking-widest rounded-2xl border-none flex items-center justify-center gap-2 hover:bg-[#00adb5] transition-all shadow-md">
                  Lanjut ke Bagian C <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {activeTab === "C" && (
            <div className="space-y-6 animate-in fade-in duration-300">
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-100 rounded-2xl p-4 md:p-5 flex items-start gap-4">
                <HelpCircle className="text-emerald-500 shrink-0 mt-0.5 w-5 h-5" />
                <div>
                  <h4 className="text-sm font-bold text-slate-800">Petunjuk Bagian C</h4>
                  <p className="text-xs text-slate-500 leading-relaxed font-medium mt-1">
                    Silakan isi pertanyaan esai berikut sesuai dengan pemahaman, pandangan, dan penalaran pribadimu secara terbuka.
                  </p>
                </div>
              </div>

              <div className="bg-white border border-slate-100 rounded-[28px] md:rounded-[35px] p-6 md:p-8 shadow-sm space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <label className="text-sm font-black text-slate-800">25. Menurut Anda, apa yang membedakan bullying dengan konflik atau pertengkaran biasa antar teman?</label>
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wider text-amber-500 bg-amber-50 px-2.5 py-1 rounded-md shrink-0 ml-4">[JAWABAN ESAI]</span>
                  </div>
                  <textarea
                    value={answersC.q25}
                    onChange={(e) => setAnswersC({ ...answersC, q25: e.target.value })}
                    placeholder="Berikan penjelasan menurut pemahamanmu..."
                    rows={3}
                    className="w-full p-4 md:p-5 bg-slate-50 border-2 border-transparent focus:border-[#00adb5]/20 focus:bg-white rounded-[22px] outline-none text-sm font-semibold leading-relaxed transition-all shadow-inner"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <label className="text-sm font-black text-slate-800">26. Jika ada teman yang sedang mengalami tekanan emosional atau sedang tidak baik-baik saja secara psikologis, tanda-tanda apa yang mungkin dapat Anda lihat?</label>
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wider text-amber-500 bg-amber-50 px-2.5 py-1 rounded-md shrink-0 ml-4">[JAWABAN ESAI]</span>
                  </div>
                  <textarea
                    value={answersC.q26}
                    onChange={(e) => setAnswersC({ ...answersC, q26: e.target.value })}
                    placeholder="Tuliskan ciri fisik, emosi, atau perubahan perilaku yang mungkin terlihat..."
                    rows={3}
                    className="w-full p-4 md:p-5 bg-slate-50 border-2 border-transparent focus:border-[#00adb5]/20 focus:bg-white rounded-[22px] outline-none text-sm font-semibold leading-relaxed transition-all shadow-inner"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <label className="text-sm font-black text-slate-800">27. Menurut Anda, apa yang dapat dilakukan seorang siswa ketika melihat temannya menjadi korban bullying?</label>
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wider text-amber-500 bg-amber-50 px-2.5 py-1 rounded-md shrink-0 ml-4">[JAWABAN ESAI]</span>
                  </div>
                  <textarea
                    value={answersC.q27}
                    onChange={(e) => setAnswersC({ ...answersC, q27: e.target.value })}
                    placeholder="Tuliskan tindakan solutif yang bisa diambil sebagai teman..."
                    rows={3}
                    className="w-full p-4 md:p-5 bg-slate-50 border-2 border-transparent focus:border-[#00adb5]/20 focus:bg-white rounded-[22px] outline-none text-sm font-semibold leading-relaxed transition-all shadow-inner"
                    required
                  />
                </div>

                <div className="p-4 md:p-6 bg-slate-50 rounded-2xl border border-slate-100/60 space-y-4">
                  <div className="flex justify-between items-center border-b border-slate-200 pb-2">
                    <label className="text-sm font-black text-slate-800">28. Jika suatu hari Anda mengalami masalah yang membuat Anda merasa sangat sedih, cemas, tertekan, atau tidak sanggup menghadapinya sendiri, kepada siapa Anda akan mencari bantuan? Dan Mengapa?</label>
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wider text-amber-500 bg-amber-50 px-2.5 py-1 rounded-md shrink-0 ml-4">[JAWABAN ESAI]</span>
                  </div>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={answersC.q28_target}
                      onChange={(e) => setAnswersC({ ...answersC, q28_target: e.target.value })}
                      placeholder="Kepada siapa Anda mencari bantuan? (Contoh: Orang tua, Sahabat, Guru BK, dll)"
                      className="w-full p-4 bg-white border border-slate-200 focus:border-[#00adb5] rounded-xl outline-none text-xs font-bold transition-all shadow-sm"
                      required
                    />
                    <textarea
                      value={answersC.q28_reason}
                      onChange={(e) => setAnswersC({ ...answersC, q28_reason: e.target.value })}
                      placeholder="Tuliskan alasan mengapa kamu memilih orang tersebut..."
                      rows={3}
                      className="w-full p-4 md:p-5 bg-white border border-slate-200 focus:border-[#00adb5] rounded-xl outline-none text-xs font-semibold leading-relaxed transition-all shadow-sm"
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <label className="text-sm font-black text-slate-800">29. Menurut Anda, mengapa sebagian siswa memilih untuk diam dan tidak bercerita ketika mengalami bullying?</label>
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wider text-amber-500 bg-amber-50 px-2.5 py-1 rounded-md shrink-0 ml-4">[JAWABAN ESAI]</span>
                  </div>
                  <textarea
                    value={answersC.q29}
                    onChange={(e) => setAnswersC({ ...answersC, q29: e.target.value })}
                    placeholder="Tuliskan faktor ketakutan atau hambatan psikologis mereka disini..."
                    rows={3}
                    className="w-full p-4 md:p-5 bg-slate-50 border-2 border-transparent focus:border-[#00adb5]/20 focus:bg-white rounded-[22px] outline-none text-sm font-semibold leading-relaxed transition-all shadow-inner"
                    required
                  />
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center border-b border-slate-50 pb-2">
                    <label className="text-sm font-black text-slate-800">30. Apa yang menurut Anda dapat dilakukan sekolah agar siswa merasa lebih aman dan nyaman ketika mengalami masalah atau bullying?</label>
                    <span className="text-[8px] md:text-[9px] font-black uppercase tracking-wider text-amber-500 bg-amber-50 px-2.5 py-1 rounded-md shrink-0 ml-4">[JAWABAN ESAI]</span>
                  </div>
                  <textarea
                    value={answersC.q30}
                    onChange={(e) => setAnswersC({ ...answersC, q30: e.target.value })}
                    placeholder="Berikan ide, saran, atau rekomendasi fasilitas pelaporan untuk sistem sekolah..."
                    rows={3}
                    className="w-full p-4 md:p-5 bg-slate-50 border-2 border-transparent focus:border-[#00adb5]/20 focus:bg-white rounded-[22px] outline-none text-sm font-semibold leading-relaxed transition-all shadow-inner"
                    required
                  />
                </div>
              </div>

              <div className="flex flex-col sm:flex-row justify-between gap-3 pt-4">
                <button type="button" onClick={() => setActiveTab("B")} className="w-full sm:w-auto h-14 px-8 bg-white text-slate-700 font-bold text-xs uppercase tracking-widest rounded-2xl border border-slate-200 flex items-center justify-center gap-2 hover:bg-slate-50 transition-all">
                  <ChevronLeft size={16} /> Kembali ke Bagian B
                </button>
                
                <button
                  type="submit"
                  disabled={submitting}
                  className="h-14 px-10 bg-[#00adb5] text-white font-black text-xs uppercase tracking-widest rounded-2xl shadow-xl shadow-[#00adb5]/20 hover:bg-opacity-90 disabled:opacity-50 transition-all flex items-center justify-center gap-2 border-none"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="animate-spin" size={16} />
                      <span>Mengunci Lembar Jawaban...</span>
                    </>
                  ) : (
                    <>
                      <span>Kirim Seluruh Kuesioner</span>
                      <Send size={14} />
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}