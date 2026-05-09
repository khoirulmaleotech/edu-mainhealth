"use client";
import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, ClipboardList, MessageCircle, 
  History, AlertCircle, Stethoscope, MoreHorizontal, Loader2
} from 'lucide-react';

export default function PsychologistPatientsPage() {
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchClinicalData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/psychologist/patients');
      const json = await res.json();
      if (json.success) setPatients(json.data);
    } catch (err) {
      console.error("Fetch error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClinicalData();
  }, []);

  // Filter Client-side
  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.issue.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-8 animate-in fade-in duration-700 text-slate-700">
      
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <h2 className="text-2xl md:text-3xl font-black text-slate-800 tracking-tight flex items-center gap-3">
            Manajemen Pasien <Stethoscope className="text-[#00adb5]" size={32} />
          </h2>
          <p className="text-slate-500 mt-1 font-medium italic text-sm md:text-base">Tinjau rujukan kasus dan kelola catatan konseling klinis.</p>
        </div>
        <div className="flex items-center bg-white px-5 py-3 rounded-2xl w-full max-w-md shadow-sm border border-slate-200 focus-within:border-[#00adb5]/50 transition-all">
          <Search size={18} className="text-slate-300 mr-2" />
          <input 
            type="text" 
            placeholder="Cari nama atau rujukan..." 
            className="bg-transparent outline-none text-sm w-full font-semibold placeholder:text-slate-300" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* PATIENT LIST TABLE */}
        <div className="lg:col-span-3 bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden order-2 lg:order-1">
          <div className="p-6 md:p-8 border-b border-slate-100 flex justify-between items-center bg-white">
            <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">Antrean Rujukan Aktif</h4>
            <button onClick={fetchClinicalData} className="text-[#00adb5] text-xs font-bold hover:underline flex items-center gap-1.5">
              Refresh Data
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse min-w-[700px]">
              <thead>
                <tr className="bg-slate-50/50">
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Pasien & Asal</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Isu Utama</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest text-center border-b border-slate-100">Prioritas</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Status</th>
                  <th className="px-8 py-5 text-[10px] font-bold text-slate-400 uppercase tracking-widest border-b border-slate-100">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center">
                      <Loader2 className="animate-spin mx-auto text-[#00adb5] mb-2" size={32} />
                      <p className="text-xs font-bold text-slate-400">Menghubungkan ke pusat data...</p>
                    </td>
                  </tr>
                ) : filteredPatients.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="py-20 text-center text-slate-400 italic text-sm">Tidak ada rujukan aktif ditemukan.</td>
                  </tr>
                ) : (
                  filteredPatients.map((p) => (
                    <tr key={p._id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="px-8 py-6">
                        <p className="text-sm font-bold text-slate-800">{p.name}</p>
                        <p className="text-[10px] text-slate-400 font-semibold italic mt-0.5">{p.origin}</p>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <AlertCircle size={14} className={p.priority === 'Critical' ? 'text-red-500' : 'text-orange-400'} />
                          <span className="text-xs font-bold text-slate-600">{p.issue}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6 text-center">
                        <span className={`px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-tighter border ${
                          p.priority === 'Critical' ? 'bg-red-50 text-red-500 border-red-100' : 
                          p.priority === 'High' ? 'bg-orange-50 text-orange-500 border-orange-100' : 'bg-blue-50 text-blue-500 border-blue-100'
                        }`}>
                          {p.priority}
                        </span>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex flex-col">
                          <span className="text-[11px] font-black text-slate-700">{p.status}</span>
                          <span className="text-[9px] text-slate-400 font-bold mt-0.5">Sesi: {p.lastSession}</span>
                        </div>
                      </td>
                      <td className="px-8 py-6">
                        <div className="flex items-center gap-2">
                          <button className="p-2.5 bg-[#00adb5]/5 text-[#00adb5] rounded-xl hover:bg-[#00adb5] hover:text-white transition-all shadow-sm border border-[#00adb5]/10">
                            <ClipboardList size={18} />
                          </button>
                          <button className="p-2.5 text-slate-300 hover:bg-slate-100 rounded-xl transition-all">
                            <MoreHorizontal size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* SIDEBAR ANALYTICS */}
        <div className="space-y-6 order-1 lg:order-2">
          <div className="bg-slate-900 p-8 rounded-[40px] text-white shadow-xl relative overflow-hidden">
            <div className="relative z-10">
              <h4 className="font-bold text-lg mb-6 flex items-center gap-2">Quick Action ⚡</h4>
              <div className="space-y-3">
                <button className="w-full py-4 bg-[#00adb5] rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:scale-[1.02] transition-transform">
                  <MessageCircle size={16} /> Konsultasi Baru
                </button>
                <button className="w-full py-4 bg-white/5 border border-white/10 rounded-2xl font-black text-[11px] uppercase tracking-widest flex items-center justify-center gap-3 hover:bg-white/10 transition-all">
                  <History size={16} /> Rekap Bulanan
                </button>
              </div>
            </div>
            <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-[#00adb5] opacity-20 rounded-full blur-3xl"></div>
          </div>

          <div className="bg-white p-8 rounded-[40px] border border-slate-200 shadow-sm space-y-5">
            <h4 className="font-bold text-[10px] text-slate-400 uppercase tracking-widest">Kapasitas Layanan</h4>
            <div className="space-y-4">
              <div className="flex justify-between items-end">
                <span className="text-xs font-bold text-slate-600">Beban Kerja</span>
                <span className="text-sm font-black text-slate-800">75%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-100 rounded-full overflow-hidden">
                <div className="w-[75%] h-full bg-[#00adb5] rounded-full shadow-[0_0_10px_rgba(0,173,181,0.3)]"></div>
              </div>
              <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 text-[10px] text-orange-700 leading-relaxed font-bold">
                ⚠️ Ada rujukan prioritas tinggi yang butuh intervensi segera.
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}