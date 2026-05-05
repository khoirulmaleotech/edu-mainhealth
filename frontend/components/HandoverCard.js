"use client";

export default function HandoverCard({ show, onCancel }) {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-md flex items-center justify-center z-50 p-6">
      <div className="bg-white w-full max-w-lg rounded-[40px] p-10 shadow-2xl text-center animate-in fade-in zoom-in duration-300">
        <div className="text-6xl mb-6">🤝</div>
        <h3 className="text-3xl font-bold text-slate-800 mb-4">Kami Siap Membantu</h3>
        <p className="text-slate-500 text-xl mb-10 leading-relaxed">
          Sepertinya kamu butuh teman diskusi yang lebih mendalam. Apakah kamu ingin melanjutkan dengan bot atau berbicara langsung dengan Psikolog kami?
        </p>
        
        <div className="grid gap-4">
          <button 
            onClick={onCancel}
            className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-xl hover:opacity-90 transition shadow-lg shadow-primary/20"
          >
            Lanjutkan Bicara dengan AI
          </button>
          <button 
            className="w-full py-5 bg-secondary text-slate-900 rounded-2xl font-bold text-xl hover:opacity-90 transition shadow-lg shadow-secondary/20"
          >
            Hubungi Psikolog Sekarang
          </button>
        </div>
        
        <button 
          onClick={onCancel}
          className="mt-6 text-slate-400 font-medium hover:text-slate-600 transition text-sm uppercase tracking-widest"
        >
          Mungkin Nanti
        </button>
      </div>
    </div>
  );
}