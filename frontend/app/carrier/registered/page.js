"use client";

import React, { useEffect, useMemo, useState } from "react";
import * as XLSX from "xlsx";
import {
  BriefcaseBusiness,
  Calendar,
  Download,
  Eye,
  Loader2,
  Lock,
  Mail,
  Phone,
  Search,
  Users,
  X,
} from "lucide-react";

import AdminPagination from "@/components/AdminPagination";
import CustomSelect from "@/components/CustomSelect";
import { CAREER_JOB_POSTS } from "@/lib/careerJobs";
import { useDebounce } from "@/hooks/useDebounce";

const pageSize = 10;
const passwordStorageKey = "carrier_registered_password";

const typeOptions = [
  { value: "all", label: "Semua Type" },
  ...Array.from(new Set(CAREER_JOB_POSTS.map((job) => job.type))).map((type) => ({
    value: type,
    label: type,
  })),
];

function formatDate(value) {
  if (!value) return "-";

  return new Intl.DateTimeFormat("id-ID", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

function formatList(items) {
  return items?.length ? items.join(", ") : "-";
}

function flattenApplication(application) {
  return {
    "Tanggal Daftar": formatDate(application.createdAt),
    "Job ID": application.job_id || "-",
    "Selected Job": application.job_snapshot?.title || "-",
    "Job Type": application.job_snapshot?.type || "-",
    "Nama Lengkap": application.applicant?.full_name || "-",
    "Nama Panggilan": application.applicant?.nick_name || "-",
    "Jenis Kelamin": application.applicant?.gender || "-",
    Domisili: application.applicant?.domicile || "-",
    WhatsApp: application.applicant?.whatsapp || "-",
    Email: application.applicant?.email || "-",
    "Profile Link": application.applicant?.profile_link || "-",
    "Pendidikan Terakhir": application.education?.level || "-",
    Universitas: application.education?.university || "-",
    "Tahun Lulus": application.education?.graduation_year || "-",
    "Bidang Keahlian": formatList(application.education?.expertise),
    "Aktivitas Saat Ini": formatList(application.experience?.current_activities),
    "Pengalaman Pendidikan": formatList(application.experience?.education_experiences),
    "Pengalaman Bermakna": application.experience?.meaningful_experience || "-",
    Motivasi: application.interest?.motivation || "-",
    "Isu Pendidikan": formatList(application.interest?.education_issues),
    "Isu Lainnya": application.interest?.education_issue_other || "-",
    "Area Kontribusi": formatList(application.interest?.contribution_areas),
    "Project Based": application.availability?.project_based || "-",
    "Wilayah Dijangkau": application.availability?.reachable_cities || "-",
    "Ketersediaan Waktu": formatList(application.availability?.times),
    "Arti Pendidikan Sehat": application.closing?.healthy_education_meaning || "-",
    "Harapan Bergabung": application.closing?.expectation || "-",
    "CV / Portofolio": application.files?.cv_portfolio?.url || "-",
    "STR / SIPP": application.files?.str_sipp?.url || "-",
    Status: application.status || "-",
  };
}

function DetailItem({ label, value }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      <p className="mt-2 text-sm font-bold leading-relaxed text-slate-700">{value || "-"}</p>
    </div>
  );
}

function DetailLinkItem({ label, file }) {
  return (
    <div className="rounded-2xl bg-slate-50 p-4">
      <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">{label}</p>
      {file?.url ? (
        <a
          href={file.url}
          target="_blank"
          rel="noreferrer"
          className="mt-2 block truncate text-sm font-black text-primary hover:underline"
        >
          {file.name || file.url}
        </a>
      ) : (
        <p className="mt-2 text-sm font-bold leading-relaxed text-slate-700">-</p>
      )}
      {file?.size ? (
        <p className="mt-1 text-[10px] font-bold text-slate-400">
          {(file.size / 1024).toFixed(1)} KB
        </p>
      ) : null}
    </div>
  );
}

function DetailSection({ title, icon, children }) {
  return (
    <section className="rounded-[28px] border border-slate-100 bg-white p-5">
      <div className="mb-4 flex items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-primary/10 text-primary">
          {icon}
        </div>
        <h4 className="text-sm font-black uppercase tracking-widest text-slate-800">
          {title}
        </h4>
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        {children}
      </div>
    </section>
  );
}

function ApplicantDetailContent({ application }) {
  const job = application.job_snapshot || {};
  const applicant = application.applicant || {};
  const education = application.education || {};
  const experience = application.experience || {};
  const interest = application.interest || {};
  const availability = application.availability || {};
  const closing = application.closing || {};
  const files = application.files || {};

  return (
    <div className="space-y-5">
      <DetailSection title="Selected Job Applicant" icon={<BriefcaseBusiness size={19} />}>
        <DetailItem label="Job ID" value={application.job_id} />
        <DetailItem label="Title" value={job.title} />
        <DetailItem label="Type" value={job.type} />
        <DetailItem label="Department" value={job.department} />
        <div className="md:col-span-2">
          <DetailItem label="Location" value={job.location} />
        </div>
      </DetailSection>

      <DetailSection title="Applicant" icon={<Users size={19} />}>
        <DetailItem label="Nama Lengkap" value={applicant.full_name} />
        <DetailItem label="Nama Panggilan" value={applicant.nick_name} />
        <DetailItem label="Jenis Kelamin" value={applicant.gender} />
        <DetailItem label="Domisili" value={applicant.domicile} />
        <DetailItem label="WhatsApp" value={applicant.whatsapp} />
        <DetailItem label="Email" value={applicant.email} />
        <div className="md:col-span-2">
          <DetailItem label="Profile Link" value={applicant.profile_link} />
        </div>
      </DetailSection>

      <DetailSection title="Education" icon={<BriefcaseBusiness size={19} />}>
        <DetailItem label="Pendidikan Terakhir" value={education.level} />
        <DetailItem label="Universitas" value={education.university} />
        <DetailItem label="Tahun Lulus" value={education.graduation_year} />
        <DetailItem label="Bidang Keahlian" value={formatList(education.expertise)} />
      </DetailSection>

      <DetailSection title="Experience" icon={<Calendar size={19} />}>
        <DetailItem label="Aktivitas Saat Ini" value={formatList(experience.current_activities)} />
        <DetailItem label="Pengalaman Pendidikan" value={formatList(experience.education_experiences)} />
        <div className="md:col-span-2">
          <DetailItem label="Pengalaman Bermakna" value={experience.meaningful_experience} />
        </div>
      </DetailSection>

      <DetailSection title="Interest" icon={<Search size={19} />}>
        <DetailItem label="Motivasi" value={interest.motivation} />
        <DetailItem label="Isu Pendidikan" value={formatList(interest.education_issues)} />
        <div className="md:col-span-2">
          <DetailItem label="Area Kontribusi" value={formatList(interest.contribution_areas)} />
        </div>
      </DetailSection>

      <DetailSection title="Availability" icon={<Phone size={19} />}>
        <DetailItem label="Project Based" value={availability.project_based} />
        <DetailItem label="Ketersediaan Waktu" value={formatList(availability.times)} />
        <div className="md:col-span-2">
          <DetailItem label="Wilayah Dijangkau" value={availability.reachable_cities} />
        </div>
      </DetailSection>

      <DetailSection title="Closing" icon={<Mail size={19} />}>
        <DetailItem label="Arti Pendidikan Sehat" value={closing.healthy_education_meaning} />
        <DetailItem label="Harapan Bergabung" value={closing.expectation} />
      </DetailSection>

      <DetailSection title="Files & Status" icon={<Download size={19} />}>
        <DetailLinkItem label="CV / Portofolio" file={files.cv_portfolio} />
        <DetailLinkItem label="STR / SIPP" file={files.str_sipp} />
        <DetailItem label="Status" value={application.status} />
        <DetailItem label="Source" value={application.source} />
        <DetailItem label="Created At" value={formatDate(application.createdAt)} />
        <DetailItem label="Updated At" value={formatDate(application.updatedAt)} />
      </DetailSection>
    </div>
  );
}

export default function CarrierRegisteredPage() {
  const [password, setPassword] = useState("");
  const [authorizedPassword, setAuthorizedPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [applications, setApplications] = useState([]);
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [pagination, setPagination] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const debouncedSearchTerm = useDebounce(searchTerm, 500);

  const isUnlocked = Boolean(authorizedPassword);

  const summary = useMemo(() => ({
    total: pagination?.totalData || applications.length,
    pageCount: applications.length,
  }), [applications.length, pagination?.totalData]);

  const fetchApplications = async ({ page = 1, search = "", type = "all", activePassword = authorizedPassword } = {}) => {
    if (!activePassword) return false;

    setLoading(true);
    setPasswordError("");

    try {
      const queryParams = new URLSearchParams({
        page: String(page),
        pageSize: String(pageSize),
        search,
        type,
      });
      const response = await fetch(`/api/carrier/applications?${queryParams.toString()}`, {
        headers: { "x-carrier-password": activePassword },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal memuat data pendaftar.");
      }

      setApplications(data.data || []);
      setPagination(data.pagination || null);
      setCurrentPage(page);
      return true;
    } catch (error) {
      setApplications([]);
      setPagination(null);
      setPasswordError(error.message);
      return false;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const savedPassword = sessionStorage.getItem(passwordStorageKey);

    if (savedPassword) {
      setAuthorizedPassword(savedPassword);
      setPassword(savedPassword);
      fetchApplications({ page: 1, activePassword: savedPassword });
    }
  }, []);

  useEffect(() => {
    if (!isUnlocked) return;
    fetchApplications({ page: 1, search: debouncedSearchTerm, type: typeFilter });
  }, [debouncedSearchTerm, typeFilter, isUnlocked]);

  const handleUnlock = async (event) => {
    event.preventDefault();
    const trimmedPassword = password.trim();
    if (!trimmedPassword) return;

    const success = await fetchApplications({ page: 1, activePassword: trimmedPassword });

    if (success) {
      sessionStorage.setItem(passwordStorageKey, trimmedPassword);
      setAuthorizedPassword(trimmedPassword);
    }
  };

  const handlePageChange = (page) => {
    if (page < 1 || page > (pagination?.totalPages || 1) || page === currentPage) return;
    fetchApplications({ page, search: debouncedSearchTerm, type: typeFilter });
  };

  const handleExport = async () => {
    if (!authorizedPassword) return;

    setExporting(true);

    try {
      const queryParams = new URLSearchParams({
        export: "1",
        search: debouncedSearchTerm,
        type: typeFilter,
      });
      const response = await fetch(`/api/carrier/applications?${queryParams.toString()}`, {
        headers: { "x-carrier-password": authorizedPassword },
      });
      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(data.message || "Gagal export data.");
      }

      const rows = (data.data || []).map(flattenApplication);
      const worksheet = XLSX.utils.json_to_sheet(rows);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, "Carrier Applicants");
      XLSX.writeFile(workbook, `carrier-applicants-${new Date().toISOString().slice(0, 10)}.xlsx`);
    } catch (error) {
      setPasswordError(error.message);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-4 md:p-8 text-slate-700">
      {!isUnlocked && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-950/50 p-4 backdrop-blur-md">
          <form onSubmit={handleUnlock} className="w-full max-w-sm rounded-[36px] bg-white p-8 shadow-2xl">
            <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-3xl bg-primary/10 text-primary">
              <Lock size={30} />
            </div>
            <h2 className="mt-6 text-center text-2xl font-black tracking-tight text-slate-900">
              Carrier Applicants
            </h2>
            <p className="mt-2 text-center text-sm font-semibold leading-relaxed text-slate-400">
              Masukkan password untuk melihat daftar pendaftar.
            </p>
            <input
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder="Password"
              className="mt-6 w-full rounded-2xl border-2 border-slate-100 bg-slate-50 px-4 py-4 text-sm font-bold outline-none focus:border-primary/30 focus:bg-white"
            />
            {passwordError && (
              <p className="mt-3 rounded-2xl bg-rose-50 px-4 py-3 text-xs font-bold text-rose-600">
                {passwordError}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="mt-5 flex w-full items-center justify-center gap-3 rounded-2xl bg-primary px-5 py-4 text-xs font-black uppercase tracking-widest text-white disabled:opacity-60"
            >
              {loading && <Loader2 className="animate-spin" size={16} />}
              Buka Data
            </button>
          </form>
        </div>
      )}

      {selectedApplication && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-950/40 p-4 backdrop-blur-md">
          <div className="max-h-[88vh] w-full max-w-4xl overflow-hidden rounded-[36px] bg-white shadow-2xl">
            <div className="flex items-start justify-between gap-4 border-b border-slate-100 bg-slate-50 p-6">
              <div>
                <p className="text-[10px] font-black uppercase tracking-widest text-primary">Detail Applicant</p>
                <h3 className="mt-2 text-2xl font-black text-slate-900">
                  {selectedApplication.applicant?.full_name}
                </h3>
                <p className="mt-1 text-sm font-bold text-slate-400">
                  {selectedApplication.job_snapshot?.title}
                </p>
              </div>
              <button onClick={() => setSelectedApplication(null)} className="rounded-full bg-white p-3 text-slate-400 shadow-sm">
                <X size={20} />
              </button>
            </div>
            <div className="max-h-[68vh] overflow-y-auto bg-slate-50 p-4 md:p-6">
              <ApplicantDetailContent application={selectedApplication} />
            </div>
          </div>
        </div>
      )}

      <div className="mx-auto max-w-7xl space-y-8">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl border border-primary/10 bg-primary/10 text-primary">
              <Users size={28} />
            </div>
            <div>
              <h1 className="text-3xl font-black tracking-tight text-slate-900">
                Carrier Applicants
              </h1>
              <p className="mt-1 text-[10px] font-black uppercase tracking-widest text-slate-400">
                Recruitment database Edumind
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={handleExport}
            disabled={!isUnlocked || exporting}
            className="flex h-14 items-center justify-center gap-3 rounded-2xl bg-primary px-6 text-xs font-black uppercase tracking-widest text-white shadow-xl shadow-primary/20 disabled:opacity-60"
          >
            {exporting ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
            Export XLSX
          </button>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          <div className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Data</p>
            <h2 className="mt-2 text-4xl font-black text-slate-900">{summary.total}</h2>
          </div>
          <div className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Data Page Ini</p>
            <h2 className="mt-2 text-4xl font-black text-slate-900">{summary.pageCount}</h2>
          </div>
          <div className="rounded-[30px] border border-slate-100 bg-white p-6 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Filter Type</p>
            <h2 className="mt-2 text-lg font-black text-slate-900">{typeOptions.find((item) => item.value === typeFilter)?.label}</h2>
          </div>
        </div>

        <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3 shadow-sm lg:w-96">
            <Search size={18} className="text-slate-300" />
            <input
              type="text"
              placeholder="Cari nama, email, WhatsApp, domisili..."
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              className="w-full bg-transparent text-xs font-bold outline-none"
            />
          </div>
          <CustomSelect
            value={typeFilter}
            onChange={setTypeFilter}
            options={typeOptions}
            placeholder="Filter Type"
            className="lg:w-72"
          />
        </div>

        <div className="overflow-hidden rounded-[35px] border border-slate-200 bg-white shadow-sm">
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full border-collapse text-left">
              <thead className="bg-slate-50 text-[10px] font-black uppercase tracking-widest text-slate-500">
                <tr>
                  <th className="w-16 border border-slate-200 px-6 py-5 text-center">No.</th>
                  <th className="border border-slate-200 px-6 py-5">Applicant</th>
                  <th className="border border-slate-200 px-6 py-5">Selected Job</th>
                  <th className="border border-slate-200 px-6 py-5">Kontak</th>
                  <th className="border border-slate-200 px-6 py-5">Domisili</th>
                  <th className="border border-slate-200 px-6 py-5">Tanggal</th>
                  <th className="border border-slate-200 px-6 py-5 text-right">Opsi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200">
                {loading ? (
                  <tr>
                    <td colSpan="7" className="p-20 text-center">
                      <Loader2 className="mx-auto animate-spin text-primary" size={40} />
                    </td>
                  </tr>
                ) : applications.length === 0 ? (
                  <tr>
                    <td colSpan="7" className="p-20 text-center text-sm font-bold italic text-slate-400">
                      Data tidak ditemukan
                    </td>
                  </tr>
                ) : applications.map((application, index) => (
                  <tr key={application._id} className="transition hover:bg-slate-50/70">
                    <td className="border border-slate-200 px-6 py-6 text-center text-xs font-black text-slate-300">
                      {((pagination?.currentPage || currentPage) - 1) * pageSize + index + 1}
                    </td>
                    <td className="border border-slate-200 px-6 py-6">
                      <p className="text-sm font-black text-slate-800">{application.applicant?.full_name}</p>
                      <p className="mt-1 text-xs font-bold text-slate-400">{application.applicant?.email}</p>
                    </td>
                    <td className="border border-slate-200 px-6 py-6">
                      <p className="text-xs font-black text-primary">{application.job_snapshot?.type}</p>
                      <p className="mt-1 text-sm font-bold text-slate-700">{application.job_snapshot?.title}</p>
                    </td>
                    <td className="border border-slate-200 px-6 py-6 text-xs font-bold text-slate-500">
                      <div className="space-y-2">
                        <p className="flex items-center gap-2"><Phone size={13} />{application.applicant?.whatsapp}</p>
                        <p className="flex items-center gap-2"><Mail size={13} />{application.applicant?.email}</p>
                      </div>
                    </td>
                    <td className="border border-slate-200 px-6 py-6 text-xs font-bold text-slate-500">
                      {application.applicant?.domicile || "-"}
                    </td>
                    <td className="border border-slate-200 px-6 py-6 text-xs font-bold text-slate-500">
                      <span className="flex items-center gap-2"><Calendar size={13} />{formatDate(application.createdAt)}</span>
                    </td>
                    <td className="border border-slate-200 px-6 py-6 text-right">
                      <button
                        type="button"
                        onClick={() => setSelectedApplication(application)}
                        className="rounded-xl bg-slate-50 p-3 text-slate-400 shadow-sm transition hover:bg-primary hover:text-white"
                      >
                        <Eye size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="space-y-4 p-4 md:hidden">
            {loading ? (
              <div className="py-12 text-center">
                <Loader2 className="mx-auto animate-spin text-primary" size={36} />
              </div>
            ) : applications.length === 0 ? (
              <div className="py-12 text-center text-sm font-bold italic text-slate-400">Data tidak ditemukan</div>
            ) : applications.map((application) => (
              <div key={application._id} className="rounded-[28px] border border-slate-100 bg-slate-50 p-5">
                <p className="text-sm font-black text-slate-800">{application.applicant?.full_name}</p>
                <p className="mt-1 text-xs font-bold text-slate-400">{application.applicant?.email}</p>
                <div className="mt-4 rounded-2xl bg-white p-4">
                  <p className="text-[10px] font-black uppercase tracking-widest text-primary">{application.job_snapshot?.type}</p>
                  <p className="mt-1 text-sm font-bold text-slate-700">{application.job_snapshot?.title}</p>
                </div>
                <div className="mt-4 flex items-center justify-between gap-4">
                  <p className="text-xs font-bold text-slate-400">{formatDate(application.createdAt)}</p>
                  <button
                    type="button"
                    onClick={() => setSelectedApplication(application)}
                    className="rounded-xl bg-white p-3 text-slate-400 shadow-sm"
                  >
                    <Eye size={18} />
                  </button>
                </div>
              </div>
            ))}
          </div>

          <AdminPagination
            currentPage={currentPage}
            pagination={pagination}
            onPageChange={handlePageChange}
          />
        </div>
      </div>
    </div>
  );
}
