"use client";

import React, { useState, useEffect } from 'react';

export default function FasilitatorDashboard() {
  const [activeKota, setActiveKota] = useState('all');

  const filterKota = (kota) => {
    setActiveKota(kota);
  };

  const data = {
    all:       {umkm:72, mhs:847, fas:118, upct:72,  mpct:84.7, fpct:78.6},
    aceh:      {umkm:17, mhs:187, fas:28,  upct:85,  mpct:93.5, fpct:93.3},
    medan:     {umkm:18, mhs:201, fas:30,  upct:90,  mpct:100,  fpct:100},
    padang:    {umkm:14, mhs:156, fas:24,  upct:70,  mpct:78,   fpct:80},
    palembang: {umkm:15, mhs:167, fas:22,  upct:75,  mpct:83.5, fpct:73.3},
    bengkulu:  {umkm:8,  mhs:136, fas:14,  upct:40,  mpct:68,   fpct:46.7},
  };
  const d = data[activeKota] || data.all;

  useEffect(() => {
    // Inject Tabler icons stylesheet if not present
    if (!document.getElementById('tabler-icons-link')) {
      const link = document.createElement('link');
      link.id = 'tabler-icons-link';
      link.rel = 'stylesheet';
      link.href = 'https://cdn.jsdelivr.net/npm/@tabler/icons-webfont@3.19.0/dist/tabler-icons.min.css';
      document.head.appendChild(link);
    }
  }, []);

  return (
    <>
      <style dangerouslySetInnerHTML={{__html: `
        .fasilitator-wrapper {font-family:'Calibri',system-ui,sans-serif;background:#0F172A;color:#F1F5F9;min-height:100vh; margin: -24px -24px -24px -24px;}
        @media (min-width: 768px) {
          .fasilitator-wrapper { margin: -40px; }
        }
        .fasilitator-wrapper .topnav{background:#1E293B;border-bottom:1px solid #334155;padding:0 24px;display:flex;align-items:center;gap:16px;height:52px}
        .fasilitator-wrapper .logo{display:flex;align-items:center;gap:10px}
        .fasilitator-wrapper .logo-dot{width:10px;height:10px;border-radius:50%;background:#0D9488}
        .fasilitator-wrapper .logo-text{font-size:14px;font-weight:700;color:#F1F5F9;letter-spacing:.02em}
        .fasilitator-wrapper .logo-sub{font-size:11px;color:#94A3B8;margin-left:4px; display:none;}
        @media (min-width: 640px) { .fasilitator-wrapper .logo-sub { display:inline; } }
        .fasilitator-wrapper .nav-spacer{flex:1}
        .fasilitator-wrapper .nav-badge{background:#0D9488;color:#fff;font-size:11px;padding:3px 10px;border-radius:20px;font-weight:600;display:none;}
        @media (min-width: 640px) { .fasilitator-wrapper .nav-badge { display:block; } }
        .fasilitator-wrapper .nav-kota{display:flex;gap:6px;flex-wrap:wrap;}
        .fasilitator-wrapper .kota-btn{background:#334155;color:#CBD5E1;font-size:11px;padding:3px 10px;border-radius:20px;border:none;cursor:pointer;transition:background .15s}
        .fasilitator-wrapper .kota-btn:hover,.fasilitator-wrapper .kota-btn.active{background:#0D9488;color:#fff}
        .fasilitator-wrapper .main-content{padding:20px 24px;display:grid;gap:16px}
        .fasilitator-wrapper .sec-label{font-size:10px;font-weight:700;letter-spacing:.12em;color:#64748B;text-transform:uppercase;margin-bottom:4px}
        .fasilitator-wrapper .progress-row{display:grid;grid-template-columns:1fr;gap:12px}
        @media (min-width: 768px) { .fasilitator-wrapper .progress-row{grid-template-columns:repeat(3,1fr)} }
        .fasilitator-wrapper .prog-card{background:#1E293B;border:1px solid #334155;border-radius:12px;padding:16px 18px}
        .fasilitator-wrapper .prog-title{font-size:11px;color:#94A3B8;margin-bottom:10px;display:flex;align-items:center;gap:6px}
        .fasilitator-wrapper .prog-title i{font-size:14px;color:#0D9488}
        .fasilitator-wrapper .prog-nums{display:flex;align-items:baseline;gap:6px;margin-bottom:10px}
        .fasilitator-wrapper .prog-current{font-size:28px;font-weight:700;color:#F1F5F9}
        .fasilitator-wrapper .prog-target{font-size:13px;color:#64748B}
        .fasilitator-wrapper .prog-bar-wrap{background:#334155;border-radius:4px;height:6px;overflow:hidden}
        .fasilitator-wrapper .prog-bar{height:6px;border-radius:4px;background:#0D9488;transition:width .6s}
        .fasilitator-wrapper .prog-pct{font-size:11px;color:#0D9488;margin-top:6px;font-weight:600}
        .fasilitator-wrapper .stat-grid{display:grid;grid-template-columns:1fr;gap:12px}
        @media (min-width: 640px) { .fasilitator-wrapper .stat-grid{grid-template-columns:repeat(2,1fr)} }
        @media (min-width: 1024px) { .fasilitator-wrapper .stat-grid{grid-template-columns:repeat(4,1fr)} }
        .fasilitator-wrapper .stat-card{background:#1E293B;border:1px solid #334155;border-radius:10px;padding:14px 16px}
        .fasilitator-wrapper .stat-icon{width:32px;height:32px;border-radius:8px;display:flex;align-items:center;justify-content:center;margin-bottom:10px;font-size:16px}
        .fasilitator-wrapper .stat-val{font-size:22px;font-weight:700;color:#F1F5F9;margin-bottom:2px}
        .fasilitator-wrapper .stat-lbl{font-size:11px;color:#64748B;line-height:1.4}
        .fasilitator-wrapper .stat-delta{font-size:11px;font-weight:600;margin-top:6px;display:flex;align-items:center;gap:3px}
        .fasilitator-wrapper .delta-up{color:#22C55E}
        .fasilitator-wrapper .delta-neutral{color:#94A3B8}
        .fasilitator-wrapper .city-section{display:grid;grid-template-columns:1fr;gap:12px}
        @media (min-width: 640px) { .fasilitator-wrapper .city-section{grid-template-columns:repeat(2,1fr)} }
        @media (min-width: 1024px) { .fasilitator-wrapper .city-section{grid-template-columns:repeat(5,1fr)} }
        .fasilitator-wrapper .city-card{background:#1E293B;border:1px solid #334155;border-radius:10px;padding:14px}
        .fasilitator-wrapper .city-name{font-size:12px;font-weight:700;color:#CBD5E1;margin-bottom:12px;display:flex;align-items:center;gap:6px}
        .fasilitator-wrapper .city-name i{font-size:14px;color:#7C3AED}
        .fasilitator-wrapper .city-metric{display:flex;justify-content:space-between;align-items:center;padding:5px 0;border-bottom:1px solid #1E293B}
        .fasilitator-wrapper .city-metric:last-child{border:none}
        .fasilitator-wrapper .city-metric-lbl{font-size:10px;color:#64748B}
        .fasilitator-wrapper .city-metric-val{font-size:12px;font-weight:700;color:#F1F5F9}
        .fasilitator-wrapper .city-metric-val.teal{color:#0D9488}
        .fasilitator-wrapper .city-metric-val.purple{color:#7C3AED}
        .fasilitator-wrapper .city-mini-bar{background:#334155;border-radius:3px;height:4px;margin-top:8px;overflow:hidden}
        .fasilitator-wrapper .city-mini-bar-fill{height:4px;border-radius:3px;background:linear-gradient(90deg,#7C3AED,#0D9488)}
        .fasilitator-wrapper .two-col{display:grid;grid-template-columns:1fr;gap:12px}
        @media (min-width: 1024px) { .fasilitator-wrapper .two-col{grid-template-columns:1.4fr 1fr} }
        .fasilitator-wrapper .panel{background:#1E293B;border:1px solid #334155;border-radius:12px;padding:16px 18px}
        .fasilitator-wrapper .panel-title{font-size:12px;font-weight:700;color:#CBD5E1;margin-bottom:14px;display:flex;align-items:center;gap:6px}
        .fasilitator-wrapper .panel-title i{color:#0D9488;font-size:16px}
        .fasilitator-wrapper .phase-row{display:flex;align-items:center;gap:10px;margin-bottom:10px}
        .fasilitator-wrapper .phase-label{font-size:11px;color:#94A3B8;width:80px;flex-shrink:0}
        .fasilitator-wrapper .phase-bar-wrap{flex:1;background:#334155;border-radius:4px;height:14px;overflow:hidden;position:relative}
        .fasilitator-wrapper .phase-bar-fill{height:14px;border-radius:4px;display:flex;align-items:center;padding-left:8px;font-size:10px;font-weight:600;color:#fff;transition:width .6s}
        .fasilitator-wrapper .phase-val{font-size:11px;color:#F1F5F9;width:32px;text-align:right;font-weight:600}
        .fasilitator-wrapper .tool-row{display:flex;align-items:center;gap:8px;margin-bottom:8px}
        .fasilitator-wrapper .tool-name{font-size:11px;color:#94A3B8;width:70px;flex-shrink:0}
        .fasilitator-wrapper .tool-bar-wrap{flex:1;background:#334155;border-radius:4px;height:10px;overflow:hidden}
        .fasilitator-wrapper .tool-bar-fill{height:10px;border-radius:4px}
        .fasilitator-wrapper .tool-pct{font-size:11px;color:#CBD5E1;width:30px;text-align:right;font-weight:600}
        .fasilitator-wrapper .feed-item{display:flex;gap:10px;padding:8px 0;border-bottom:1px solid #334155}
        .fasilitator-wrapper .feed-item:last-child{border:none}
        .fasilitator-wrapper .feed-dot{width:8px;height:8px;border-radius:50%;margin-top:4px;flex-shrink:0}
        .fasilitator-wrapper .feed-content{flex:1}
        .fasilitator-wrapper .feed-title{font-size:12px;color:#CBD5E1;margin-bottom:2px}
        .fasilitator-wrapper .feed-meta{font-size:10px;color:#64748B}
        .fasilitator-wrapper .sdg-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px}
        .fasilitator-wrapper .sdg-card{border-radius:8px;padding:10px 12px;text-align:center}
        .fasilitator-wrapper .sdg-num{font-size:18px;font-weight:700;margin-bottom:2px}
        .fasilitator-wrapper .sdg-lbl{font-size:9px;font-weight:600;letter-spacing:.06em}
        .fasilitator-wrapper .sdg-desc{font-size:10px;margin-top:4px;line-height:1.3;opacity:.85}
        .fasilitator-wrapper .timestamp{font-size:10px;color:#475569;text-align:right;padding-top:4px}
      `}} />

      <div className="fasilitator-wrapper">
        <div className="topnav">
          <div className="logo">
            <div className="logo-dot"></div>
            <span className="logo-text">BISA VOKASI</span>
            <span className="logo-sub">Dashboard Monitoring &middot; Sumatera Chapter</span>
          </div>
          <div className="nav-spacer"></div>
          <div className="nav-kota">
            {['all', 'aceh', 'medan', 'padang', 'palembang', 'bengkulu'].map((kota) => (
              <button
                key={kota}
                className={"kota-btn " + (activeKota === kota ? "active" : "")}
                onClick={() => filterKota(kota)}
              >
                {kota === 'all' ? 'Semua Kota' : kota.charAt(0).toUpperCase() + kota.slice(1)}
              </button>
            ))}
          </div>
          <div className="nav-badge">
            <i className="ti ti-circle-filled" style={{fontSize: "9px", verticalAlign: "1px"}}></i> Live
          </div>
        </div>

        <div className="main-content">
          {/* PROGRESS SECTION */}
          <div>
            <div className="sec-label">Progress program &mdash; capaian terhadap target</div>
            <div className="progress-row">
              <div className="prog-card">
                <div className="prog-title"><i className="ti ti-users" aria-hidden="true"></i>Target UMKM Terdampingi</div>
                <div className="prog-nums"><span className="prog-current">{d.umkm}</span><span className="prog-target">/ 100 UMKM</span></div>
                <div className="prog-bar-wrap"><div className="prog-bar" style={{width: `${d.upct}%`}}></div></div>
                <div className="prog-pct">{d.upct}% tercapai</div>
              </div>
              <div className="prog-card">
                <div className="prog-title"><i className="ti ti-school" aria-hidden="true"></i>Target Mahasiswa Tersertifikasi</div>
                <div className="prog-nums"><span className="prog-current">{d.mhs.toLocaleString('id-ID')}</span><span className="prog-target">/ 1.000 Mahasiswa</span></div>
                <div className="prog-bar-wrap"><div className="prog-bar" style={{width: `${d.mpct}%`, background: "#7C3AED"}}></div></div>
                <div className="prog-pct" style={{color: "#7C3AED"}}>{d.mpct.toLocaleString('id-ID')}% tersertifikasi</div>
              </div>
              <div className="prog-card">
                <div className="prog-title"><i className="ti ti-award" aria-hidden="true"></i>Target AI Fasilitator Aktif</div>
                <div className="prog-nums"><span className="prog-current">{d.fas}</span><span className="prog-target">/ 150 Fasilitator</span></div>
                <div className="prog-bar-wrap"><div className="prog-bar" style={{width: `${d.fpct}%`, background: "#D97706"}}></div></div>
                <div className="prog-pct" style={{color: "#D97706"}}>{d.fpct.toLocaleString('id-ID')}% fasilitator aktif</div>
              </div>
            </div>
          </div>

          {/* STAT CARDS */}
          <div>
            <div className="sec-label">Kategori: Program</div>
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{background: "#0D948820"}}><i className="ti ti-presentation" style={{color: "#0D9488"}} aria-hidden="true"></i></div>
                <div className="stat-val">5</div>
                <div className="stat-lbl">Sesi ToT AI Fasilitator terlaksana</div>
                <div className="stat-delta delta-up"><i className="ti ti-check" aria-hidden="true"></i>Semua kota selesai</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{background: "#7C3AED20"}}><i className="ti ti-book-2" style={{color: "#7C3AED"}} aria-hidden="true"></i></div>
                <div className="stat-val">14</div>
                <div className="stat-lbl">Pelatihan mahasiswa dilaksanakan (semua kota)</div>
                <div className="stat-delta delta-up"><i className="ti ti-trending-up" aria-hidden="true"></i>+2 dari bulan lalu</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{background: "#D9770620"}}><i className="ti ti-clock-hour-4" style={{color: "#D97706"}} aria-hidden="true"></i></div>
                <div className="stat-val">8,4 jam</div>
                <div className="stat-lbl">Rata-rata durasi pendampingan AI Fasilitator</div>
                <div className="stat-delta delta-up"><i className="ti ti-trending-up" aria-hidden="true"></i>+1,2 jam vs minggu lalu</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{background: "#22C55E20"}}><i className="ti ti-certificate" style={{color: "#22C55E"}} aria-hidden="true"></i></div>
                <div className="stat-val">847</div>
                <div className="stat-lbl">Mahasiswa tersertifikasi &amp; aktif (seluruh kota)</div>
                <div className="stat-delta delta-neutral"><i className="ti ti-minus" aria-hidden="true"></i>153 belum tersertifikasi</div>
              </div>
            </div>
          </div>

          {/* UMKM PENDAMPINGAN */}
          <div>
            <div className="sec-label">Kategori: Pendampingan UMKM</div>
            <div className="stat-grid">
              <div className="stat-card">
                <div className="stat-icon" style={{background: "#0D948820"}}><i className="ti ti-building-store" style={{color: "#0D9488"}} aria-hidden="true"></i></div>
                <div className="stat-val">72</div>
                <div className="stat-lbl">Total UMKM yang didampingi (aktif semua kota)</div>
                <div className="stat-delta delta-up"><i className="ti ti-trending-up" aria-hidden="true"></i>+8 minggu ini</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{background: "#7C3AED20"}}><i className="ti ti-target" aria-hidden="true" style={{color: "#7C3AED"}}></i></div>
                <div className="stat-val">72%</div>
                <div className="stat-lbl">Penyelesaian terhadap target 100 UMKM</div>
                <div className="stat-delta delta-up"><i className="ti ti-trending-up" aria-hidden="true"></i>On track</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{background: "#22C55E20"}}><i className="ti ti-check-circle" style={{color: "#22C55E"}} aria-hidden="true"></i></div>
                <div className="stat-val">31</div>
                <div className="stat-lbl">UMKM selesai pendampingan (Fase C rampung)</div>
                <div className="stat-delta delta-up"><i className="ti ti-trending-up" aria-hidden="true"></i>+5 bulan ini</div>
              </div>
              <div className="stat-card">
                <div className="stat-icon" style={{background: "#D9770620"}}><i className="ti ti-chart-line" style={{color: "#D97706"}} aria-hidden="true"></i></div>
                <div className="stat-val">+23%</div>
                <div className="stat-lbl">Rata-rata kenaikan omset UMKM (vs baseline)</div>
                <div className="stat-delta delta-up"><i className="ti ti-trending-up" aria-hidden="true"></i>58 UMKM lapor naik</div>
              </div>
            </div>
          </div>

          {/* PER KOTA */}
          <div>
            <div className="sec-label">Status per kota</div>
            <div className="city-section">
              <div className="city-card">
                <div className="city-name"><i className="ti ti-map-pin" aria-hidden="true"></i>Aceh</div>
                <div className="city-metric"><span className="city-metric-lbl">ToT selesai</span><span className="city-metric-val teal">✓</span></div>
                <div className="city-metric"><span className="city-metric-lbl">Mhs tersertif.</span><span className="city-metric-val">187</span></div>
                <div className="city-metric"><span className="city-metric-lbl">UMKM aktif</span><span className="city-metric-val teal">17/20</span></div>
                <div className="city-metric"><span className="city-metric-lbl">Fase C selesai</span><span className="city-metric-val purple">9</span></div>
                <div className="city-mini-bar"><div className="city-mini-bar-fill" style={{width: "85%"}}></div></div>
              </div>
              <div className="city-card">
                <div className="city-name"><i className="ti ti-map-pin" aria-hidden="true"></i>Medan</div>
                <div className="city-metric"><span className="city-metric-lbl">ToT selesai</span><span className="city-metric-val teal">✓</span></div>
                <div className="city-metric"><span className="city-metric-lbl">Mhs tersertif.</span><span className="city-metric-val">201</span></div>
                <div className="city-metric"><span className="city-metric-lbl">UMKM aktif</span><span className="city-metric-val teal">18/20</span></div>
                <div className="city-metric"><span className="city-metric-lbl">Fase C selesai</span><span className="city-metric-val purple">8</span></div>
                <div className="city-mini-bar"><div className="city-mini-bar-fill" style={{width: "90%"}}></div></div>
              </div>
              <div className="city-card">
                <div className="city-name"><i className="ti ti-map-pin" aria-hidden="true"></i>Padang</div>
                <div className="city-metric"><span className="city-metric-lbl">ToT selesai</span><span className="city-metric-val teal">✓</span></div>
                <div className="city-metric"><span className="city-metric-lbl">Mhs tersertif.</span><span className="city-metric-val">156</span></div>
                <div className="city-metric"><span className="city-metric-lbl">UMKM aktif</span><span className="city-metric-val teal">14/20</span></div>
                <div className="city-metric"><span className="city-metric-lbl">Fase C selesai</span><span className="city-metric-val purple">6</span></div>
                <div className="city-mini-bar"><div className="city-mini-bar-fill" style={{width: "70%"}}></div></div>
              </div>
              <div className="city-card">
                <div className="city-name"><i className="ti ti-map-pin" aria-hidden="true"></i>Palembang</div>
                <div className="city-metric"><span className="city-metric-lbl">ToT selesai</span><span className="city-metric-val teal">✓</span></div>
                <div className="city-metric"><span className="city-metric-lbl">Mhs tersertif.</span><span className="city-metric-val">167</span></div>
                <div className="city-metric"><span className="city-metric-lbl">UMKM aktif</span><span className="city-metric-val teal">15/20</span></div>
                <div className="city-metric"><span className="city-metric-lbl">Fase C selesai</span><span className="city-metric-val purple">5</span></div>
                <div className="city-mini-bar"><div className="city-mini-bar-fill" style={{width: "75%"}}></div></div>
              </div>
              <div className="city-card">
                <div className="city-name"><i className="ti ti-map-pin" aria-hidden="true"></i>Bengkulu</div>
                <div className="city-metric"><span className="city-metric-lbl">ToT selesai</span><span className="city-metric-val teal">✓</span></div>
                <div className="city-metric"><span className="city-metric-lbl">Mhs tersertif.</span><span className="city-metric-val">136</span></div>
                <div className="city-metric"><span className="city-metric-lbl">UMKM aktif</span><span className="city-metric-val teal">8/20</span></div>
                <div className="city-metric"><span className="city-metric-lbl">Fase C selesai</span><span className="city-metric-val purple">3</span></div>
                <div className="city-mini-bar"><div className="city-mini-bar-fill" style={{width: "40%"}}></div></div>
              </div>
            </div>
          </div>

          {/* FASE + AI TOOLS */}
          <div className="two-col">
            <div className="panel">
              <div className="panel-title"><i className="ti ti-layers-difference" aria-hidden="true"></i>Distribusi fase pendampingan UMKM (72 aktif)</div>
              <div className="phase-row">
                <span className="phase-label">Fase A &middot; Onboarding</span>
                <div className="phase-bar-wrap"><div className="phase-bar-fill" style={{width: "57%", background: "#334155", color: "#94A3B8"}}>41 UMKM</div></div>
                <span className="phase-val">41</span>
              </div>
              <div className="phase-row">
                <span className="phase-label">Fase B &middot; Implementasi</span>
                <div className="phase-bar-wrap"><div className="phase-bar-fill" style={{width: "100%", background: "#0D9488"}}>31 UMKM</div></div>
                <span className="phase-val">31</span>
              </div>
              <div className="phase-row">
                <span className="phase-label">Fase C &middot; Konsolidasi</span>
                <div className="phase-bar-wrap"><div className="phase-bar-fill" style={{width: "43%", background: "#7C3AED"}}>6 UMKM</div></div>
                <span className="phase-val">6</span>
              </div>
              <div style={{marginTop: "16px", paddingTop: "14px", borderTop: "1px solid #334155"}}>
                <div className="sec-label" style={{marginBottom: "8px"}}>Distribusi sektor UMKM</div>
                <div style={{display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: "6px"}}>
                  <div style={{background: "#334155", borderRadius: "6px", padding: "7px", textAlign: "center"}}><div style={{fontSize: "14px", fontWeight: "700", color: "#0D9488"}}>28</div><div style={{fontSize: "10px", color: "#64748B"}}>Kuliner</div></div>
                  <div style={{background: "#334155", borderRadius: "6px", padding: "7px", textAlign: "center"}}><div style={{fontSize: "14px", fontWeight: "700", color: "#7C3AED"}}>18</div><div style={{fontSize: "10px", color: "#64748B"}}>Kriya</div></div>
                  <div style={{background: "#334155", borderRadius: "6px", padding: "7px", textAlign: "center"}}><div style={{fontSize: "14px", fontWeight: "700", color: "#D97706"}}>12</div><div style={{fontSize: "10px", color: "#64748B"}}>Fashion</div></div>
                  <div style={{background: "#334155", borderRadius: "6px", padding: "7px", textAlign: "center"}}><div style={{fontSize: "14px", fontWeight: "700", color: "#22C55E"}}>8</div><div style={{fontSize: "10px", color: "#64748B"}}>Pertanian</div></div>
                  <div style={{background: "#334155", borderRadius: "6px", padding: "7px", textAlign: "center"}}><div style={{fontSize: "14px", fontWeight: "700", color: "#60A5FA"}}>4</div><div style={{fontSize: "10px", color: "#64748B"}}>Jasa</div></div>
                  <div style={{background: "#334155", borderRadius: "6px", padding: "7px", textAlign: "center"}}><div style={{fontSize: "14px", fontWeight: "700", color: "#94A3B8"}}>2</div><div style={{fontSize: "10px", color: "#64748B"}}>Lainnya</div></div>
                </div>
              </div>
            </div>

            <div style={{display: "flex", flexDirection: "column", gap: "12px"}}>
              <div className="panel" style={{flex: 1}}>
                <div className="panel-title"><i className="ti ti-robot" aria-hidden="true"></i>AI tools adoption (UMKM aktif)</div>
                <div className="tool-row">
                  <span className="tool-name">Canva AI</span>
                  <div className="tool-bar-wrap"><div className="tool-bar-fill" style={{width: "88%", background: "#0D9488", height: "10px", borderRadius: "4px"}}></div></div>
                  <span className="tool-pct">88%</span>
                </div>
                <div className="tool-row">
                  <span className="tool-name">ChatGPT</span>
                  <div className="tool-bar-wrap"><div className="tool-bar-fill" style={{width: "74%", background: "#7C3AED", height: "10px", borderRadius: "4px"}}></div></div>
                  <span className="tool-pct">74%</span>
                </div>
                <div className="tool-row">
                  <span className="tool-name">WA AI</span>
                  <div className="tool-bar-wrap"><div className="tool-bar-fill" style={{width: "62%", background: "#0D9488", height: "10px", borderRadius: "4px"}}></div></div>
                  <span className="tool-pct">62%</span>
                </div>
                <div className="tool-row">
                  <span className="tool-name">TikTok AI</span>
                  <div className="tool-bar-wrap"><div className="tool-bar-fill" style={{width: "45%", background: "#D97706", height: "10px", borderRadius: "4px"}}></div></div>
                  <span className="tool-pct">45%</span>
                </div>
                <div className="tool-row">
                  <span className="tool-name">Shopee AI</span>
                  <div className="tool-bar-wrap"><div className="tool-bar-fill" style={{width: "31%", background: "#334155", height: "10px", borderRadius: "4px"}}></div></div>
                  <span className="tool-pct">31%</span>
                </div>
              </div>
              <div className="panel" style={{flex: "0 0 auto"}}>
                <div className="panel-title"><i className="ti ti-leaf" aria-hidden="true"></i>SDGs yang didukung</div>
                <div className="sdg-grid">
                  <div className="sdg-card" style={{background: "#1E3A5F"}}><div className="sdg-num" style={{color: "#60A5FA"}}>SDG 4</div><div className="sdg-lbl" style={{color: "#93C5FD"}}>Pendidikan</div><div className="sdg-desc" style={{color: "#BFDBFE"}}>847 mahasiswa tersertifikasi</div></div>
                  <div className="sdg-card" style={{background: "#14532D"}}><div className="sdg-num" style={{color: "#4ADE80"}}>SDG 8</div><div className="sdg-lbl" style={{color: "#86EFAC"}}>Pekerjaan</div><div className="sdg-desc" style={{color: "#BBF7D0"}}>72 UMKM bertumbuh</div></div>
                  <div className="sdg-card" style={{background: "#3B0764"}}><div className="sdg-num" style={{color: "#C084FC"}}>SDG 9</div><div className="sdg-lbl" style={{color: "#DDD6FE"}}>Inovasi</div><div className="sdg-desc" style={{color: "#EDE9FE"}}>5 ekosistem digital lokal</div></div>
                </div>
              </div>
            </div>
          </div>

          {/* ACTIVITY FEED */}
          <div className="panel">
            <div className="panel-title"><i className="ti ti-bell" aria-hidden="true"></i>Aktivitas &amp; notifikasi terbaru</div>
            <div>
              <div className="feed-item"><div className="feed-dot" style={{background: "#22C55E"}}></div><div className="feed-content"><div className="feed-title">UMKM &quot;Dapur Bungo&quot; Padang selesai Fase C &mdash; omset naik 34%</div><div className="feed-meta">Padang &middot; 2 jam lalu &middot; Dilaporkan: Siti Rahma (mahasiswa)</div></div></div>
              <div className="feed-item"><div className="feed-dot" style={{background: "#0D9488"}}></div><div className="feed-content"><div className="feed-title">8 UMKM baru mulai onboarding di Bengkulu &mdash; total 8/20 tercapai</div><div className="feed-meta">Bengkulu &middot; 4 jam lalu &middot; Divalidasi: Local Partner Bengkulu</div></div></div>
              <div className="feed-item"><div className="feed-dot" style={{background: "#D97706"}}></div><div className="feed-content"><div className="feed-title">Laporan minggu ke-6 dari 3 mahasiswa Medan belum masuk</div><div className="feed-meta">Medan &middot; Kemarin &middot; Perlu tindak lanjut mentor</div></div></div>
              <div className="feed-item"><div className="feed-dot" style={{background: "#7C3AED"}}></div><div className="feed-content"><div className="feed-title">ToT batch Aceh selesai &mdash; 30 AI Fasilitator tersertifikasi</div><div className="feed-meta">Aceh &middot; 3 hari lalu &middot; Divalidasi: DIFI</div></div></div>
            </div>
          </div>

          <div className="timestamp">Diperbarui otomatis &middot; Terakhir sync: Selasa, 17 Juni 2026 &middot; 14:32 WIB &middot; Sumber: Looker Studio API</div>
        </div>
      </div>
    </>
  );
}
