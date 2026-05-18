"use client";

import React, { useMemo, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  BriefcaseBusiness,
  ChevronDown,
  CheckCircle2,
  ClipboardList,
  HeartHandshake,
  Loader2,
  MapPin,
  Sparkles,
  UploadCloud,
  Users,
} from "lucide-react";

import { CAREER_JOB_POSTS } from "@/lib/careerJobs";

const initialForm = {
  fullName: "",
  nickName: "",
  gender: "",
  domicile: "",
  whatsapp: "",
  email: "",
  profileLink: "",
  educationLevel: "",
  university: "",
  graduationYear: "",
  meaningfulExperience: "",
  motivation: "",
  educationIssueOther: "",
  contributionAreaOther: "",
  projectBasedAvailability: "",
  reachableCities: "",
  healthyEducationMeaning: "",
  expectation: "",
};

const expertiseOptions = [
  "Psikologi Pendidikan",
  "Psikologi Klinis",
  "Tumbuh Kembang Anak",
  "Educational Assessment",
  "Career & Talent Mapping",
  "Konseling Anak & Remaja",
  "Parenting",
  "Lainnya",
];

const activityOptions = [
  "Praktik Psikolog",
  "Guru BK",
  "Dosen",
  "Konsultan Pendidikan",
  "Terapis",
  "Freelance",
  "Fulltime Employee",
  "Lainnya",
];

const educationExperienceOptions = [
  "Asesmen psikologi siswa",
  "Observasi sekolah",
  "Pendampingan siswa",
  "Konseling remaja",
  "Training guru/orang tua",
  "Talent mapping",
  "Intervensi wellbeing",
  "Penanganan kasus anak",
  "Riset pendidikan",
  "Belum ada pengalaman",
];

const educationIssueOptions = [
  "Mental health siswa",
  "Bullying",
  "Salah jurusan",
  "Anak kehilangan motivasi",
  "Talenta tidak terdeteksi",
  "Parent awareness",
  "Teacher wellbeing",
  "Lainnya",
];

const contributionAreaOptions = [
  "Asesmen siswa",
  "Konseling",
  "School wellbeing program",
  "Talent mapping",
  "Workshop guru",
  "Parenting session",
  "Research & AI education",
  "Content education",
  "Project coordinator",
];

const availabilityOptions = [
  "Weekday",
  "Weekend",
  "Hybrid",
  "Online only",
  "Flexible",
];

function toggleOption(items, value) {
  return items.includes(value)
    ? items.filter((item) => item !== value)
    : [...items, value];
}

function Field({ label, required, children }) {
  return (
    <label className="block">
      <span className="text-[11px] font-black uppercase tracking-widest text-slate-500">
        {label} {required && <span className="text-primary">*</span>}
      </span>
      <div className="mt-2">{children}</div>
    </label>
  );
}

function TextInput(props) {
  return (
    <input
      {...props}
      className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none transition focus:border-primary/30 focus:bg-white"
    />
  );
}

function TextArea(props) {
  return (
    <textarea
      {...props}
      className="min-h-28 w-full resize-y rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold leading-relaxed text-slate-700 outline-none transition focus:border-primary/30 focus:bg-white"
    />
  );
}

function CheckboxGroup({ options, selected, onToggle }) {
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {options.map((option) => {
        const active = selected.includes(option);

        return (
          <button
            key={option}
            type="button"
            onClick={() => onToggle(option)}
            className={`flex items-center gap-3 rounded-2xl border px-4 py-3 text-left text-xs font-black transition ${active
              ? "border-primary bg-primary/10 text-primary"
              : "border-slate-100 bg-white text-slate-500 hover:border-primary/30"
              }`}
          >
            <CheckCircle2 size={16} className={active ? "opacity-100" : "opacity-25"} />
            {option}
          </button>
        );
      })}
    </div>
  );
}

function FileField({ label, file, onChange, optional }) {
  return (
    <label className="block rounded-3xl border-2 border-dashed border-slate-200 bg-slate-50 p-5 transition hover:border-primary/40">
      <input
        type="file"
        accept=".pdf,.doc,.docx,.png,.jpg,.jpeg"
        className="hidden"
        onChange={(event) => onChange(event.target.files?.[0] || null)}
      />
      <div className="flex items-center gap-4">
        <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-white text-primary shadow-sm">
          <UploadCloud size={22} />
        </div>
        <div className="min-w-0">
          <p className="text-xs font-black uppercase tracking-widest text-slate-700">
            {label} {optional && <span className="text-slate-400">(optional)</span>}
          </p>
          <p className="mt-1 truncate text-xs font-bold text-slate-400">
            {file?.name || "PDF, DOC, DOCX, PNG, JPG"}
          </p>
        </div>
      </div>
    </label>
  );
}

function CollapsibleSection({
  id,
  title,
  icon,
  step,
  isOpen,
  isComplete,
  onToggle,
  children,
}) {
  return (
    <section className="overflow-hidden rounded-[28px] border border-slate-100 bg-white shadow-sm">
      <button
        type="button"
        onClick={() => onToggle(id)}
        className="flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition hover:bg-slate-50"
      >
        <div className="flex min-w-0 items-center gap-3">
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl ${isOpen ? "bg-primary text-white" : "bg-primary/10 text-primary"}`}>
            {icon}
          </div>
          <div className="min-w-0">
            <p className="text-[9px] font-black uppercase tracking-[0.24em] text-slate-400">
              Langkah {step}
            </p>
            <h3 className="truncate text-sm font-black uppercase tracking-widest text-slate-800">
              {title}
            </h3>
          </div>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          {isComplete && (
            <span className="hidden rounded-full bg-emerald-50 px-3 py-1 text-[9px] font-black uppercase tracking-widest text-emerald-600 sm:inline-flex">
              Terisi
            </span>
          )}
          <ChevronDown
            size={20}
            className={`text-slate-300 transition-transform ${isOpen ? "rotate-180" : ""}`}
          />
        </div>
      </button>
      {isOpen && (
        <div className="space-y-5 border-t border-slate-100 bg-slate-50/60 p-5">
          {children}
        </div>
      )}
    </section>
  );
}

export default function CareerPage() {
  const [selectedJobId, setSelectedJobId] = useState(CAREER_JOB_POSTS[0]?.id || "");
  const [openSection, setOpenSection] = useState("job");
  const [form, setForm] = useState(initialForm);
  const [expertise, setExpertise] = useState([]);
  const [activities, setActivities] = useState([]);
  const [educationExperiences, setEducationExperiences] = useState([]);
  const [educationIssues, setEducationIssues] = useState([]);
  const [contributionAreas, setContributionAreas] = useState([]);
  const [availability, setAvailability] = useState([]);
  const [cvFile, setCvFile] = useState(null);
  const [strFile, setStrFile] = useState(null);
  const [status, setStatus] = useState({ type: "", message: "" });
  const [showSuccessPopup, setShowSuccessPopup] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const selectedJob = useMemo(
    () => CAREER_JOB_POSTS.find((job) => job.id === selectedJobId),
    [selectedJobId],
  );

  const updateForm = (key, value) => {
    setForm((previous) => ({ ...previous, [key]: value }));
  };

  const updateWhatsapp = (value) => {
    updateForm("whatsapp", value.replace(/\D/g, ""));
  };

  const toggleSection = (sectionId) => {
    setOpenSection((current) => current === sectionId ? "" : sectionId);
  };

  const completedSections = [
    Boolean(selectedJobId),
    Boolean(form.fullName && form.nickName && form.gender && form.domicile && form.whatsapp && form.email),
    Boolean(form.educationLevel && form.university && form.graduationYear && expertise.length && activities.length && educationExperiences.length && form.meaningfulExperience),
    Boolean(form.motivation && educationIssues.length && contributionAreas.length),
    Boolean(form.projectBasedAvailability && form.reachableCities && availability.length),
    Boolean(form.healthyEducationMeaning && form.expectation && (cvFile || form.profileLink)),
  ].filter(Boolean).length;

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: "", message: "" });
    setShowSuccessPopup(false);

    if (!/^8\d{7,13}$/.test(form.whatsapp)) {
      setStatus({
        type: "error",
        message: "Nomor WhatsApp harus diawali angka 8 setelah prefix +62.",
      });
      setOpenSection("personal");
      return;
    }

    setIsSubmitting(true);

    const payload = new FormData();
    payload.append("jobId", selectedJobId);

    Object.entries(form).forEach(([key, value]) => {
      payload.append(key, value);
    });

    payload.append("expertise", JSON.stringify(expertise));
    payload.append("activities", JSON.stringify(activities));
    payload.append("educationExperiences", JSON.stringify(educationExperiences));
    payload.append("educationIssues", JSON.stringify(educationIssues));
    payload.append("contributionAreas", JSON.stringify(contributionAreas));
    payload.append("availability", JSON.stringify(availability));

    if (cvFile) payload.append("cvFile", cvFile);
    if (strFile) payload.append("strFile", strFile);

    try {
      const response = await fetch("/api/carrier/applications", {
        method: "POST",
        body: payload,
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal mengirim pendaftaran.");
      }

      setStatus({
        type: "success",
        message: "Pendaftaran berhasil dikirim. Tim Edumind akan meninjau data kamu.",
      });
      setShowSuccessPopup(true);
      setForm(initialForm);
      setExpertise([]);
      setActivities([]);
      setEducationExperiences([]);
      setEducationIssues([]);
      setContributionAreas([]);
      setAvailability([]);
      setCvFile(null);
      setStrFile(null);
    } catch (error) {
      setStatus({ type: "error", message: error.message });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8f5ed] font-sans text-slate-800 selection:bg-primary selection:text-white">
      {showSuccessPopup && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 px-4 backdrop-blur-sm">
          <div className="w-full max-w-sm rounded-[32px] bg-white p-7 text-center shadow-2xl animate-in fade-in zoom-in-95 duration-200">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-emerald-50 text-emerald-500">
              <CheckCircle2 size={34} />
            </div>
            <h3 className="mt-5 text-2xl font-black tracking-tight text-slate-900">
              Pendaftaran terkirim
            </h3>
            <p className="mt-3 text-sm font-semibold leading-relaxed text-slate-500">
              Tim Edumind akan meninjau data kamu dan menghubungi melalui email atau WhatsApp jika ada tahapan lanjutan.
            </p>
            <button
              type="button"
              onClick={() => setShowSuccessPopup(false)}
              className="mt-6 w-full rounded-2xl bg-primary px-5 py-4 text-xs font-black uppercase tracking-widest text-white shadow-lg shadow-primary/20"
            >
              Mengerti
            </button>
          </div>
        </div>
      )}

      <nav className="sticky top-0 z-40 border-b border-primary/10 bg-[#f8f5ed]/85 backdrop-blur-xl">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <Link href="/" className="flex items-center gap-3">
            <Image src="/images/logo-edumind-transparan.png" alt="EduMind" width={44} height={44} />
            <div>
              <p className="text-xl font-black uppercase leading-none tracking-tighter text-primary">EduMind</p>
              <p className="text-[9px] font-black uppercase tracking-[0.28em] text-slate-400">Career</p>
            </div>
          </Link>
          <Link href="/" className="flex items-center gap-2 rounded-2xl bg-white px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-600 shadow-sm transition hover:text-primary">
            <ArrowLeft size={16} />
            Beranda
          </Link>
        </div>
      </nav>

      <main className="mx-auto max-w-7xl px-4 py-6 sm:px-6 lg:py-16">
        <section className="grid gap-6 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="space-y-4 lg:sticky lg:top-28 lg:space-y-6">
            <div className="overflow-hidden rounded-[30px] bg-primary p-6 text-white shadow-2xl shadow-primary/20 sm:rounded-[36px] sm:p-8">
              <div className="flex items-center gap-3">
                <Image src="/images/logo-edumind-transparan.png" alt="EduMind" width={52} height={52} className="brightness-125" />
                <div>
                  <p className="text-xl font-black leading-none tracking-tight sm:text-2xl">Edumind.id</p>
                  <p className="mt-1 text-[10px] font-black uppercase tracking-[0.32em] text-white/70">AI • Expert • Impact</p>
                </div>
              </div>

              <div className="mt-7 space-y-4 sm:mt-10 sm:space-y-5">
                <p className="inline-flex items-center gap-2 rounded-full bg-white/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest">
                  <Sparkles size={14} />
                  Recruitment Psychologist Partner
                </p>
                <h1 className="text-3xl font-black leading-tight tracking-tighter sm:text-4xl md:text-5xl">
                  Bersama, kita sehatkan siswa Indonesia dan tangkap talenta mereka sejak dini.
                </h1>
                <p className="text-sm font-semibold leading-relaxed text-white/80">
                  Edumind membuka kesempatan bagi psikolog pendidikan dan klinis untuk bergabung secara project-based berdasarkan school client di daerah masing-masing.
                </p>
              </div>

              <div className="mt-6 rounded-[24px] bg-secondary p-5 text-slate-900 sm:mt-8 sm:rounded-[28px]">
                <p className="text-base font-black leading-snug sm:text-lg">
                  Satu keahlianmu, jutaan masa depan bisa berubah.
                </p>
                <p className="mt-2 text-xs font-bold leading-relaxed text-slate-700">
                  Karena setiap anak Indonesia berhak dipahami, ditumbuhkan, dan menemukan potensinya.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {[
                ["Berimpact Nyata", "Membantu siswa lebih sehat mental dan optimal."],
                ["Kolaborasi AI & Expert", "Bekerja dengan teknologi AI dan tim ahli."],
                ["Peran Fleksibel", "Kontribusi bermakna dengan fleksibilitas waktu."],
                ["Tumbuh Bersama", "Kesempatan belajar dan meningkatkan kompetensi."],
              ].map(([title, desc]) => (
                <div key={title} className="rounded-[22px] border border-primary/10 bg-white p-4 shadow-sm sm:rounded-[28px] sm:p-5">
                  <HeartHandshake className="text-primary" size={20} />
                  <h3 className="mt-3 text-xs font-black text-slate-800 sm:mt-4 sm:text-sm">{title}</h3>
                  <p className="mt-2 text-[11px] font-semibold leading-relaxed text-slate-500 sm:text-xs">{desc}</p>
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} className="flex h-[calc(100vh-92px)] min-h-[620px] flex-col overflow-hidden rounded-[30px] border border-slate-100 bg-white shadow-xl shadow-slate-200/70 sm:rounded-[36px] lg:sticky lg:top-24 lg:h-[calc(100vh-120px)]">
            <div className="border-b border-slate-100 bg-white p-5 md:p-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <p className="text-[10px] font-black uppercase tracking-[0.28em] text-primary">Form Pendaftaran</p>
                  <h2 className="mt-2 text-2xl font-black tracking-tight text-slate-900 md:text-3xl">
                    Lengkapi per bagian.
                  </h2>
                </div>
                <div className="rounded-2xl bg-primary/10 px-4 py-3 text-center">
                  <p className="text-lg font-black leading-none text-primary">{completedSections}/6</p>
                  <p className="mt-1 text-[9px] font-black uppercase tracking-widest text-primary">Selesai</p>
                </div>
              </div>
              <div className="mt-4 h-2 overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-primary transition-all"
                  style={{ width: `${(completedSections / 6) * 100}%` }}
                />
              </div>
            </div>

            <div className="flex-1 space-y-4 overflow-y-auto bg-slate-50/70 p-4 md:p-5">
              <CollapsibleSection
                id="job"
                step="1"
                title="Job Opportunity"
                icon={<BriefcaseBusiness size={20} />}
                isOpen={openSection === "job"}
                isComplete={Boolean(selectedJobId)}
                onToggle={toggleSection}
              >
                <div className="grid gap-4">
                  {CAREER_JOB_POSTS.map((job) => {
                    const active = selectedJobId === job.id;

                    return (
                      <button
                        key={job.id}
                        type="button"
                        onClick={() => setSelectedJobId(job.id)}
                        className={`rounded-[24px] border-2 p-4 text-left transition sm:p-5 ${active
                          ? "border-primary bg-white shadow-lg shadow-primary/10"
                          : "border-transparent bg-white hover:border-primary/20"
                          }`}
                      >
                        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                          <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-primary sm:text-xs">{job.type}</p>
                            <h4 className="mt-2 text-lg font-black text-slate-900 sm:text-xl">{job.title}</h4>
                            <p className="mt-2 text-xs font-semibold leading-relaxed text-slate-500 sm:text-sm">{job.summary}</p>
                          </div>
                          <span className="inline-flex w-fit items-center gap-2 rounded-full bg-primary/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-primary">
                            {active ? "Dipilih" : "Pilih"}
                          </span>
                        </div>
                        <div className="mt-4 flex items-center gap-2 text-xs font-bold text-slate-400">
                          <MapPin size={15} />
                          {job.location}
                        </div>
                      </button>
                    );
                  })}
                </div>
                {selectedJob && (
                  <div className="mt-4 grid gap-2 rounded-3xl bg-primary p-5 text-white">
                    {selectedJob.highlights.map((item) => (
                      <div key={item} className="flex items-center gap-3 text-xs font-bold">
                        <CheckCircle2 size={16} className="text-secondary" />
                        {item}
                      </div>
                    ))}
                  </div>
                )}
              </CollapsibleSection>

              <CollapsibleSection
                id="personal"
                step="2"
                title="Data Diri"
                icon={<Users size={20} />}
                isOpen={openSection === "personal"}
                isComplete={Boolean(form.fullName && form.nickName && form.gender && form.domicile && form.whatsapp && form.email)}
                onToggle={toggleSection}
              >
                <div className="grid gap-4 md:grid-cols-2">
                  <Field label="Nama Lengkap" required><TextInput value={form.fullName} onChange={(e) => updateForm("fullName", e.target.value)} /></Field>
                  <Field label="Nama Panggilan" required><TextInput value={form.nickName} onChange={(e) => updateForm("nickName", e.target.value)} /></Field>
                  <Field label="Jenis Kelamin" required>
                    <select value={form.gender} onChange={(e) => updateForm("gender", e.target.value)} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-primary/30">
                      <option value="">Pilih</option>
                      <option value="Perempuan">Perempuan</option>
                      <option value="Laki-laki">Laki-laki</option>
                      <option value="Tidak ingin menyebutkan">Tidak ingin menyebutkan</option>
                    </select>
                  </Field>
                  <Field label="Domisili Kota/Kabupaten" required><TextInput value={form.domicile} onChange={(e) => updateForm("domicile", e.target.value)} /></Field>
                  <Field label="Nomor WhatsApp" required>
                    <div className="flex overflow-hidden rounded-2xl border-2 border-slate-100 bg-slate-50 transition focus-within:border-primary/30 focus-within:bg-white">
                      <span className="flex items-center border-r border-slate-200 bg-white px-4 text-sm font-black text-slate-500">
                        +62
                      </span>
                      <input
                        inputMode="numeric"
                        value={form.whatsapp}
                        onChange={(e) => updateWhatsapp(e.target.value)}
                        placeholder="81234567890"
                        className="w-full bg-transparent px-4 py-3 text-sm font-bold text-slate-700 outline-none"
                      />
                    </div>
                    <p className="mt-2 text-[10px] font-bold text-slate-400">
                      Masukkan nomor tanpa 0, harus diawali angka 8.
                    </p>
                  </Field>
                  <Field label="Email Aktif" required><TextInput type="email" value={form.email} onChange={(e) => updateForm("email", e.target.value)} /></Field>
                  <div className="md:col-span-2">
                    <Field label="Link LinkedIn / CV / Portofolio">
                      <TextInput value={form.profileLink} onChange={(e) => updateForm("profileLink", e.target.value)} placeholder="https://" />
                    </Field>
                  </div>
                </div>
              </CollapsibleSection>

              <CollapsibleSection
                id="experience"
                step="3"
                title="Pendidikan & Pengalaman"
                icon={<ClipboardList size={20} />}
                isOpen={openSection === "experience"}
                isComplete={Boolean(form.educationLevel && form.university && form.graduationYear && expertise.length && activities.length && educationExperiences.length && form.meaningfulExperience)}
                onToggle={toggleSection}
              >
                <div className="grid gap-4 md:grid-cols-3">
                  <Field label="Pendidikan Terakhir" required>
                    <select value={form.educationLevel} onChange={(e) => updateForm("educationLevel", e.target.value)} className="w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-3 text-sm font-bold text-slate-700 outline-none focus:border-primary/30">
                      <option value="">Pilih</option>
                      <option value="S1 Psikologi">S1 Psikologi</option>
                      <option value="Profesi Psikolog">Profesi Psikolog</option>
                      <option value="S2 / S3">S2 / S3</option>
                    </select>
                  </Field>
                  <Field label="Universitas Asal" required><TextInput value={form.university} onChange={(e) => updateForm("university", e.target.value)} /></Field>
                  <Field label="Tahun Lulus" required><TextInput value={form.graduationYear} onChange={(e) => updateForm("graduationYear", e.target.value)} /></Field>
                </div>

                <Field label="Bidang Keahlian" required>
                  <CheckboxGroup options={expertiseOptions} selected={expertise} onToggle={(option) => setExpertise((items) => toggleOption(items, option))} />
                </Field>

                <Field label="Saat ini sedang beraktivitas sebagai" required>
                  <CheckboxGroup options={activityOptions} selected={activities} onToggle={(option) => setActivities((items) => toggleOption(items, option))} />
                </Field>

                <Field label="Pengalaman di dunia pendidikan" required>
                  <CheckboxGroup options={educationExperienceOptions} selected={educationExperiences} onToggle={(option) => setEducationExperiences((items) => toggleOption(items, option))} />
                </Field>

                <Field label="Ceritakan pengalaman paling bermakna bersama siswa / sekolah" required>
                  <TextArea value={form.meaningfulExperience} onChange={(e) => updateForm("meaningfulExperience", e.target.value)} />
                </Field>
              </CollapsibleSection>

              <CollapsibleSection
                id="interest"
                step="4"
                title="Minat Bergabung"
                icon={<HeartHandshake size={20} />}
                isOpen={openSection === "interest"}
                isComplete={Boolean(form.motivation && educationIssues.length && contributionAreas.length)}
                onToggle={toggleSection}
              >
                <Field label="Kenapa tertarik bergabung dengan Edumind?" required>
                  <TextArea value={form.motivation} onChange={(e) => updateForm("motivation", e.target.value)} />
                </Field>
                <Field label="Isu pendidikan yang ingin kamu bantu selesaikan" required>
                  <CheckboxGroup options={educationIssueOptions} selected={educationIssues} onToggle={(option) => setEducationIssues((items) => toggleOption(items, option))} />
                </Field>
                {educationIssues.includes("Lainnya") && (
                  <Field label="Isu lainnya"><TextInput value={form.educationIssueOther} onChange={(e) => updateForm("educationIssueOther", e.target.value)} /></Field>
                )}
                <Field label="Area kontribusi yang diminati" required>
                  <CheckboxGroup options={contributionAreaOptions} selected={contributionAreas} onToggle={(option) => setContributionAreas((items) => toggleOption(items, option))} />
                </Field>
              </CollapsibleSection>

              <CollapsibleSection
                id="availability"
                step="5"
                title="Ketersediaan"
                icon={<MapPin size={20} />}
                isOpen={openSection === "availability"}
                isComplete={Boolean(form.projectBasedAvailability && form.reachableCities && availability.length)}
                onToggle={toggleSection}
              >
                <Field label="Bersedia project-based sesuai school client?" required>
                  <div className="grid grid-cols-2 gap-3">
                    {["Ya", "Tidak"].map((option) => (
                      <button
                        key={option}
                        type="button"
                        onClick={() => updateForm("projectBasedAvailability", option)}
                        className={`rounded-2xl border px-4 py-3 text-xs font-black transition ${form.projectBasedAvailability === option
                          ? "border-primary bg-primary/10 text-primary"
                          : "border-slate-100 bg-white text-slate-500"
                          }`}
                      >
                        {option}
                      </button>
                    ))}
                  </div>
                </Field>
                <Field label="Kota/wilayah yang siap dijangkau untuk project" required>
                  <TextInput value={form.reachableCities} onChange={(e) => updateForm("reachableCities", e.target.value)} />
                </Field>
                <Field label="Ketersediaan waktu" required>
                  <CheckboxGroup options={availabilityOptions} selected={availability} onToggle={(option) => setAvailability((items) => toggleOption(items, option))} />
                </Field>
              </CollapsibleSection>

              <CollapsibleSection
                id="closing"
                step="6"
                title="Penutup & Dokumen"
                icon={<UploadCloud size={20} />}
                isOpen={openSection === "closing"}
                isComplete={Boolean(form.healthyEducationMeaning && form.expectation && (cvFile || form.profileLink))}
                onToggle={toggleSection}
              >
                <Field label="Apa arti pendidikan yang sehat menurutmu?" required>
                  <TextArea value={form.healthyEducationMeaning} onChange={(e) => updateForm("healthyEducationMeaning", e.target.value)} />
                </Field>
                <Field label="Harapan jika bergabung bersama Edumind.id" required>
                  <TextArea value={form.expectation} onChange={(e) => updateForm("expectation", e.target.value)} />
                </Field>
                <div className="grid gap-4 md:grid-cols-2">
                  <FileField label="Upload CV / Portofolio" file={cvFile} onChange={setCvFile} />
                  <FileField label="Upload STR/SIPP" file={strFile} onChange={setStrFile} optional />
                </div>
              </CollapsibleSection>
            </div>

            <div className="border-t border-slate-100 bg-white p-4 md:p-5">
              {status.message && status.type !== "success" && (
                <div className={`mb-3 rounded-3xl px-5 py-4 text-sm font-bold ${status.type === "success"
                  ? "bg-emerald-50 text-emerald-700"
                  : "bg-rose-50 text-rose-700"
                  }`}>
                  {status.message}
                </div>
              )}

              <button
                type="submit"
                disabled={isSubmitting}
                className="flex w-full items-center justify-center gap-3 rounded-[24px] bg-primary px-8 py-5 text-sm font-black uppercase tracking-widest text-white shadow-2xl shadow-primary/25 transition hover:scale-[1.01] disabled:opacity-60"
              >
                {isSubmitting ? <Loader2 className="animate-spin" size={18} /> : <ArrowRight size={18} />}
                Kirim Pendaftaran
              </button>
            </div>
          </form>
        </section>
      </main>
    </div>
  );
}
