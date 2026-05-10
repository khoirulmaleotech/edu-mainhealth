"use client";
import React, { useState, useEffect } from 'react';
import { 
  Edit2, Trash2, Loader2, X, Save, Clock, MapPin, 
  Image as ImageIcon, Upload, Eye, ChevronLeft, ChevronRight, Calendar, AlertTriangle
} from 'lucide-react';
import { useSession } from "next-auth/react"; // Tambahkan import session

export default function ReportListPage() {
  const { data: session } = useSession(); // Ambil data session
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingReport, setEditingReport] = useState(null);
  const [isSaving, setIsSaving] = useState(false);
  const [newFile, setNewFile] = useState(null);
  const [previewImage, setPreviewImage] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 20;

  // State untuk Modal Delete
  const [deleteId, setDeleteId] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    // Tambahkan gate session agar API hanya dipanggil jika session sudah ada
    if (session?.user?.id) {
      fetchReports();
    }
  }, [session?.user?.id]); // Dependensi ID agar stabil

  const fetchReports = async () => {
    try {
      const res = await fetch('/api/student/report');
      const data = await res.json();
      if (data.success) setReports(data.reports);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = reports.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(reports.length / itemsPerPage);

  // Fungsi Delete yang diperbarui
  const confirmDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/student/report?id=${deleteId}`, { method: 'DELETE' });
      if (res.ok) {
        setReports(reports.filter(r => r._id !== deleteId));
        setDeleteId(null);
      }
    } catch (err) {
      alert("Gagal menghapus");
    } finally {
      setIsDeleting(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const formDataPayload = new FormData();
      formDataPayload.append('id', editingReport._id);
      formDataPayload.append('incidentType', editingReport.incident_type);
      formDataPayload.append('location', editingReport.location);
      formDataPayload.append('time', editingReport.occurrence_time);
      formDataPayload.append('description', editingReport.description);
      if (newFile) formDataPayload.append('file', newFile);

      const res = await fetch('/api/student/report', {
        method: 'PATCH',
        body: formDataPayload,
      });

      if (res.ok) {
        setEditingReport(null);
        setNewFile(null);
        setPreviewImage(null);
        fetchReports();
      }
    } catch (err) {
      alert("Gagal memperbarui");
    } finally {
      setIsSaving(false);
    }
  };

  const formatFullDate = (dateString) => {
    const d = new Date(dateString);
    const date = d.toLocaleDateString('id-ID', { day: '2-digit', month: '2-digit', year: 'numeric' });
    const time = d.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    return `${date} ${time}`;
  };

  if (loading) return (
    <div className="h-[400px] flex items-center justify-center">
      <Loader2 className="animate-spin text-[#00adb5]" size={40} />
    </div>
  );

  return (
    <div className="w-full px-4 md:px-8 pb-10 space-y-8 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-3xl font-bold text-slate-800 tracking-tight">Riwayat laporan</h2>
          <p className="text-slate-500 font-medium text-sm mt-1">Total {reports.length} laporan dalam sistem.</p>
        </div>
        <button 
          onClick={() => window.location.href = '/dashboard/student/report/create'}
          className="px-6 py-3 bg-[#00adb5] text-white rounded-2xl font-bold text-sm shadow-lg shadow-[#00adb5]/20 hover:scale-105 transition-all"
        >
          Buat laporan baru
        </button>
      </div>

      <div className="hidden md:block bg-white rounded-[30px] border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse border border-slate-200 text-xs">
          <thead>
            <tr className="bg-slate-50 text-slate-600">
              <th className="p-4 border border-slate-200 text-center font-bold w-12">No</th>
              <th className="p-4 border border-slate-200 font-bold">Waktu lapor</th>
              <th className="p-4 border border-slate-200 font-bold">Foto</th>
              <th className="p-4 border border-slate-200 font-bold">Kategori</th>
              <th className="p-4 border border-slate-200 font-bold">Lokasi</th>
              <th className="p-4 border border-slate-200 font-bold">Waktu kejadian</th>
              <th className="p-4 border border-slate-200 font-bold w-1/5">Deskripsi</th>
              <th className="p-4 border border-slate-200 font-bold text-center">Status</th>
              <th className="p-4 border border-slate-200 font-bold text-center">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200">
            {currentItems.map((item, index) => (
              <tr key={item._id} className="hover:bg-slate-50/50 transition-colors text-slate-700">
                <td className="p-4 border border-slate-200 text-center font-bold text-slate-400">
                  {indexOfFirstItem + index + 1}
                </td>
                <td className="p-4 border border-slate-200 whitespace-nowrap font-bold text-slate-600">
                  {formatFullDate(item.created_at)}
                </td>
                <td className="p-4 border border-slate-200">
                  {item.evidence_url ? (
                    <div className="w-10 h-10 rounded-lg overflow-hidden border border-slate-100 cursor-pointer" onClick={() => window.open(item.evidence_url, '_blank')}>
                      <img src={item.evidence_url} className="w-full h-full object-cover" alt="Bukti" />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-lg bg-slate-50 flex items-center justify-center text-slate-200 border border-dashed border-slate-200">
                      <ImageIcon size={14} />
                    </div>
                  )}
                </td>
                <td className="p-4 border border-slate-200 font-bold text-[#00adb5]">
                  {item.incident_type}
                </td>
                <td className="p-4 border border-slate-200">
                  <span className="flex items-center gap-1.5"><MapPin size={12} className="text-slate-400"/> {item.location}</span>
                </td>
                <td className="p-4 border border-slate-200 font-medium text-slate-600">
                   <span className="flex items-center gap-1.5"><Clock size={12} className="text-slate-400"/> {item.occurrence_time}</span>
                </td>
                <td className="p-4 border border-slate-200">
                  <p className="line-clamp-2 italic text-slate-500">"{item.description}"</p>
                </td>
                <td className="p-4 border border-slate-200 text-center">
                  <span className={`px-2 py-1 rounded-full text-[9px] font-bold border ${
                    item.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
                  }`}>
                    {item.status === 'pending' ? 'MENUNGGU' : 'SELESAI'}
                  </span>
                </td>
                <td className="p-4 border border-slate-200 text-center">
                  <div className="flex items-center justify-center gap-1">
                    <button onClick={() => setEditingReport(item)} className="p-2 text-slate-400 hover:text-[#00adb5] hover:bg-slate-50 rounded-lg transition-all"><Edit2 size={14} /></button>
                    <button onClick={() => setDeleteId(item._id)} className="p-2 text-slate-400 hover:text-rose-500 hover:bg-slate-50 rounded-lg transition-all"><Trash2 size={14} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="md:hidden space-y-4">
        {currentItems.map((item, index) => (
          <div key={item._id} className="bg-white p-5 rounded-[25px] border border-slate-200 shadow-sm space-y-4">
            <div className="flex justify-between items-start">
              <span className="text-[10px] font-black text-slate-300">#{indexOfFirstItem + index + 1}</span>
              <span className={`px-2 py-1 rounded-lg text-[9px] font-bold border ${
                item.status === 'pending' ? 'bg-amber-50 text-amber-600 border-amber-100' : 'bg-emerald-50 text-emerald-600 border-emerald-100'
              }`}>
                {item.status === 'pending' ? 'MENUNGGU' : 'SELESAI'}
              </span>
            </div>
            <div className="flex gap-4 items-center">
              {item.evidence_url ? (
                <img src={item.evidence_url} className="w-14 h-14 rounded-xl object-cover border border-slate-100" />
              ) : (
                <div className="w-14 h-14 rounded-xl bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center text-slate-200"><ImageIcon size={16} /></div>
              )}
              <div>
                <h4 className="text-sm font-bold text-slate-800">{item.incident_type}</h4>
                <p className="text-[10px] font-bold text-slate-400 flex items-center gap-1 mt-1 uppercase"><Calendar size={10} /> {formatFullDate(item.created_at)}</p>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-2 text-[10px] font-bold">
              <div className="bg-slate-50 p-2 rounded-lg text-slate-500 flex items-center gap-1.5 border border-slate-100"><MapPin size={12} className="text-[#00adb5]" /> {item.location}</div>
              <div className="bg-slate-50 p-2 rounded-lg text-slate-500 flex items-center gap-1.5 border border-slate-100"><Clock size={12} className="text-[#00adb5]" /> {item.occurrence_time}</div>
            </div>
            <p className="text-xs text-slate-500 italic bg-slate-50 p-3 rounded-xl border border-slate-100">"{item.description}"</p>
            <div className="flex justify-end gap-2 pt-2 border-t border-slate-50">
              <button onClick={() => setEditingReport(item)} className="p-2 text-slate-400 hover:text-[#00adb5]"><Edit2 size={16} /></button>
              <button onClick={() => setDeleteId(item._id)} className="p-2 text-slate-400 hover:text-rose-500"><Trash2 size={16} /></button>
            </div>
          </div>
        ))}
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-4">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(prev => prev - 1)} className="p-2 rounded-xl border border-slate-200 disabled:opacity-30"><ChevronLeft size={18} /></button>
          {[...Array(totalPages)].map((_, i) => (
            <button key={i} onClick={() => setCurrentPage(i + 1)} className={`w-9 h-9 rounded-xl font-bold text-xs ${currentPage === i + 1 ? 'bg-[#00adb5] text-white shadow-lg' : 'bg-white text-slate-400 border border-slate-100'}`}>{i + 1}</button>
          ))}
          <button disabled={currentPage === totalPages} onClick={() => setCurrentPage(prev => prev + 1)} className="p-2 rounded-xl border border-slate-200 disabled:opacity-30"><ChevronRight size={18} /></button>
        </div>
      )}

      {/* MODAL EDIT */}
      {editingReport && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-2xl rounded-[30px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
              <h3 className="text-lg font-bold text-slate-800">Edit laporan kejadian</h3>
              <button onClick={() => { setEditingReport(null); setPreviewImage(null); }} className="text-slate-400 hover:text-slate-600"><X size={20} /></button>
            </div>
            <form onSubmit={handleUpdate} className="p-6 space-y-6 overflow-y-auto max-h-[80vh]">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Kategori</label>
                    <select value={editingReport.incident_type} onChange={(e) => setEditingReport({...editingReport, incident_type: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#00adb5] outline-none">
                      <option value="Verbal Bullying">Verbal Bullying</option>
                      <option value="Physical Bullying">Physical Bullying</option>
                      <option value="Cyberbullying">Cyberbullying</option>
                      <option value="Social Exclusion">Social Exclusion</option>
                      <option value="Lainnya">Lainnya</option>
                    </select>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Lokasi</label>
                      <input type="text" value={editingReport.location} onChange={(e) => setEditingReport({...editingReport, location: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#00adb5] outline-none" />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-500 uppercase">Waktu</label>
                      <input type="text" value={editingReport.occurrence_time} onChange={(e) => setEditingReport({...editingReport, occurrence_time: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#00adb5] outline-none" />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-500 uppercase">Deskripsi</label>
                    <textarea rows="4" value={editingReport.description} onChange={(e) => setEditingReport({...editingReport, description: e.target.value})} className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:border-[#00adb5] outline-none resize-none" />
                  </div>
                </div>
                <div className="space-y-4">
                  <label className="text-xs font-bold text-slate-500 uppercase">Foto Bukti</label>
                  <div className="relative group aspect-square bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200 flex flex-col items-center justify-center overflow-hidden">
                    {previewImage || editingReport.evidence_url ? (
                      <img src={previewImage || editingReport.evidence_url} className="w-full h-full object-cover" alt="Preview" />
                    ) : (
                      <ImageIcon size={40} className="text-slate-200" />
                    )}
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                      <label className="cursor-pointer bg-white text-slate-800 px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-2">
                        <Upload size={14} /> Ganti Foto
                        <input type="file" accept="image/*" className="hidden" onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) { setNewFile(file); setPreviewImage(URL.createObjectURL(file)); }
                        }} />
                      </label>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex gap-3 pt-4">
                <button type="button" onClick={() => { setEditingReport(null); setPreviewImage(null); }} className="flex-1 py-3 border border-slate-200 text-slate-600 rounded-xl font-bold text-sm">Batal</button>
                <button type="submit" disabled={isSaving} className="flex-[2] py-3 bg-[#00adb5] text-white rounded-xl font-bold text-sm flex items-center justify-center gap-2">
                  {isSaving ? <Loader2 className="animate-spin" size={18} /> : <><Save size={18} /> Simpan</>}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL KONFIRMASI DELETE KUSTOM */}
      {deleteId && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
          <div className="bg-white w-full max-w-sm rounded-[30px] shadow-2xl overflow-hidden animate-in zoom-in duration-300">
            <div className="p-8 text-center space-y-4">
              <div className="w-20 h-20 bg-rose-50 text-rose-500 rounded-full flex items-center justify-center mx-auto shadow-inner">
                <AlertTriangle size={40} />
              </div>
              <div className="space-y-2">
                <h3 className="text-xl font-bold text-slate-800">Hapus Laporan?</h3>
                <p className="text-sm text-slate-500 leading-relaxed">
                  Tindakan ini tidak dapat dibatalkan. Laporan akan dihapus secara permanen dari sistem.
                </p>
              </div>
              <div className="flex gap-3 pt-4">
                <button 
                  onClick={() => setDeleteId(null)}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-slate-100 text-slate-600 rounded-2xl font-bold text-sm hover:bg-slate-200 transition-all"
                >
                  Batal
                </button>
                <button 
                  onClick={confirmDelete}
                  disabled={isDeleting}
                  className="flex-1 py-3 bg-rose-500 text-white rounded-2xl font-bold text-sm hover:bg-rose-600 shadow-lg shadow-rose-200 transition-all flex items-center justify-center gap-2"
                >
                  {isDeleting ? <Loader2 className="animate-spin" size={16} /> : "Ya, Hapus"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}