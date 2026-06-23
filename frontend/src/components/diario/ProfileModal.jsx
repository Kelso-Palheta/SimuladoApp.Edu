"use client";

import { useState } from 'react';
import { updateProfile } from 'firebase/auth';
import { auth } from '@/lib/firebase';

export function ProfileModal({ user, onClose }) {
  const [nome, setNome] = useState(user?.displayName || '');
  const [msg, setMsg] = useState({ text: '', type: '' });
  const [saving, setSaving] = useState(false);

  const hasGoogle = user?.providerData?.some(p => p.providerId === 'google.com');
  const hasPwd = user?.providerData?.some(p => p.providerId === 'password');

  const flash = (text, type = 'ok') => {
    setMsg({ text, type });
    setTimeout(() => setMsg({ text: '', type: '' }), 4000);
  };

  const handleSaveNome = async () => {
    if (!nome.trim() || nome.trim() === (user?.displayName || '')) return;
    setSaving(true);
    try {
      await updateProfile(auth.currentUser, { displayName: nome.trim() });
      flash('Nome atualizado!');
    } catch (err) {
      flash(err?.message || 'Erro ao salvar.', 'err');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div className="bg-white border border-slate-200 rounded-3xl shadow-2xl w-full max-w-md mx-4 overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="px-6 pt-6 pb-4 border-b border-slate-200 flex items-center justify-between">
          <h2 className="text-lg font-bold text-slate-900 tracking-tight">Meu Perfil</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 transition-colors p-1">
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
            </svg>
          </button>
        </div>

        <div className="px-6 py-5 space-y-6">
          {msg.text && (
            <div className={`text-xs font-medium px-3 py-2 rounded-lg border ${msg.type === 'err' ? 'bg-red-50 text-red-600 border-red-200' : 'bg-green-50 text-green-600 border-green-200'}`}>
              {msg.text}
            </div>
          )}

          <div className="flex items-center gap-4">
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" className="w-14 h-14 rounded-2xl border-2 border-violet-200" referrerPolicy="no-referrer" />
            ) : (
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-violet-700 to-violet-400 flex items-center justify-center text-white text-xl font-bold">
                {(user?.displayName || user?.email || '?')[0].toUpperCase()}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold text-slate-900 truncate">{user?.displayName || 'Sem nome'}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email}</p>
              <div className="flex gap-1.5 mt-1.5">
                {hasGoogle && <span className="px-2 py-0.5 bg-blue-50 text-blue-500 border border-blue-200 rounded-full text-[10px] font-semibold">Google</span>}
                {hasPwd && <span className="px-2 py-0.5 bg-violet-50 text-violet-500 border border-violet-200 rounded-full text-[10px] font-semibold">Senha</span>}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] uppercase tracking-wider text-slate-400 font-semibold mb-1.5">Nome de exibição</label>
            <div className="flex gap-2">
              <input
                type="text" value={nome} onChange={(e) => setNome(e.target.value)} placeholder="Seu nome"
                className="flex-1 px-3.5 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 placeholder-slate-400 outline-none focus:bg-white focus:ring-2 focus:ring-violet-400/50 transition-all"
              />
              <button
                onClick={handleSaveNome} disabled={saving || nome.trim() === (user?.displayName || '')}
                className="px-4 py-2 bg-violet-500 hover:bg-violet-400 disabled:bg-slate-200 disabled:text-slate-400 rounded-xl text-white text-xs font-semibold transition-all whitespace-nowrap"
              >
                Salvar
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
