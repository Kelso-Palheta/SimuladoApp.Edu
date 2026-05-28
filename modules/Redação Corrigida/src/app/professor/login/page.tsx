'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ShieldCheck, Lock, Loader2, ArrowRight, Mail, User, UserPlus } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

export default function ProfessorLoginPage() {
  const [mode, setMode] = useState<'login' | 'register' | 'recovery'>('login');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess('');

    try {
      if (mode === 'register') {
        const res = await fetch('/api/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ name, email, password })
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error);
          setIsLoading(false);
          return;
        }
        setSuccess('Conta criada! Fazendo login...');
        localStorage.setItem('prof_auth', 'true');
        localStorage.setItem('prof_user', JSON.stringify(data.user));
        setTimeout(() => router.push('/professor'), 1000);
      } else if (mode === 'recovery') {
        const res = await fetch('/api/auth/reset', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, newPassword: password })
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error);
          setIsLoading(false);
          return;
        }
        setSuccess('Senha redefinida com sucesso!');
        setTimeout(() => {
          setMode('login');
          setPassword('');
          setSuccess('');
          setIsLoading(false);
        }, 2000);
        return; // Early return to avoid setIsLoading(false) from running below prematurely
      } else {
        const res = await fetch('/api/auth/login', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email, password })
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error);
          setIsLoading(false);
          return;
        }
        localStorage.setItem('prof_auth', 'true');
        localStorage.setItem('prof_user', JSON.stringify(data.user));
        router.push('/professor');
      }
    } catch {
      setError('Erro de conexão. Tente novamente.');
    }
    setIsLoading(false);
  };

  const switchMode = () => {
    setMode(mode === 'login' ? 'register' : 'login');
    setError('');
    setSuccess('');
  };


  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full max-w-sm space-y-8"
      >
        <div className="text-center space-y-3">
          <div className="mx-auto w-16 h-16 bg-violet-500/10 rounded-2xl border border-violet-500/20 flex items-center justify-center shadow-[0_0_40px_-10px_rgba(139,92,246,0.4)]">
            {mode === 'login' ? <ShieldCheck size={32} className="text-violet-400" /> : <UserPlus size={32} className="text-violet-400" />}
          </div>
          <AnimatePresence mode="wait">
            <motion.div
              key={mode}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <h2 className="text-3xl font-bold">{mode === 'login' ? 'Entrar' : mode === 'register' ? 'Criar Conta' : 'Recuperar Senha'}</h2>
              <p className="text-neutral-400 text-sm font-medium">
                {mode === 'login' ? 'Acesse o Painel do Professor.' : mode === 'register' ? 'Cadastre-se para começar a corrigir.' : 'Defina uma nova senha de acesso.'}
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <AnimatePresence mode="wait">
            {mode === 'register' && (
              <motion.div
                key="name-field"
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                className="overflow-hidden"
              >
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500">
                    <User size={18} />
                  </div>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Seu nome completo"
                    className="block w-full pl-12 pr-4 py-4 bg-neutral-900 border border-white/5 rounded-2xl focus:border-violet-500/50 outline-none transition-all text-white"
                    required={mode === 'register'}
                  />
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500">
              <Mail size={18} />
            </div>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Seu e-mail"
              className="block w-full pl-12 pr-4 py-4 bg-neutral-900 border border-white/5 rounded-2xl focus:border-violet-500/50 outline-none transition-all text-white"
              required
            />
          </div>

          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-neutral-500">
              <Lock size={18} />
            </div>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder={mode === 'register' ? 'Crie uma senha (mín. 6 caracteres)' : mode === 'recovery' ? 'Nova senha (mín. 6 caracteres)' : 'Sua senha'}
              className="block w-full pl-12 pr-4 py-4 bg-neutral-900 border border-white/5 rounded-2xl focus:border-violet-500/50 outline-none transition-all text-white"
              required
              minLength={mode !== 'login' ? 6 : undefined}
            />
          </div>

          {error && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-red-400 text-xs font-bold text-center bg-red-500/10 p-3 rounded-xl border border-red-500/20"
            >
              {error}
            </motion.p>
          )}

          {success && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="text-emerald-400 text-xs font-bold text-center bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20"
            >
              {success}
            </motion.p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-violet-600 hover:bg-violet-500 disabled:opacity-50 transition-all rounded-2xl text-white font-bold flex items-center justify-center gap-2 group shadow-lg shadow-violet-600/20"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : mode === 'login' ? (
              'Entrar no Painel'
            ) : mode === 'register' ? (
              'Criar Minha Conta'
            ) : (
              'Redefinir Senha'
            )}
            {!isLoading && <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <div className="text-center space-y-4 flex flex-col items-center">
          {mode === 'login' && (
            <button
              type="button"
              onClick={() => { setMode('recovery'); setError(''); setSuccess(''); }}
              className="text-xs text-neutral-500 hover:text-white transition-colors"
            >
              Esqueceu sua senha?
            </button>
          )}
          <button
            type="button"
            onClick={switchMode}
            className="text-sm text-neutral-500 hover:text-violet-400 transition-colors font-medium mt-2"
          >
            {mode === 'login' ? (
              <>Ainda não tem conta? <span className="text-violet-400 font-bold">Cadastre-se</span></>
            ) : mode === 'register' ? (
              <>Já tem conta? <span className="text-violet-400 font-bold">Faça login</span></>
            ) : (
              <>Lembrou a senha? <span className="text-violet-400 font-bold">Voltar ao login</span></>
            )}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
