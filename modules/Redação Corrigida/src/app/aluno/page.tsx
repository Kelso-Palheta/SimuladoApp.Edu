'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { GraduationCap, ArrowRight, Loader2, Search } from 'lucide-react';
import { motion } from 'framer-motion';

export default function StudentLoginPage() {
  const [id, setId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (id.length < 4) return;
    setIsLoading(true);
    router.push(`/aluno/${id.toUpperCase()}`);
  };

  return (
    <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="w-full max-w-md space-y-8 text-center"
      >
        <div className="mx-auto w-20 h-20 bg-indigo-500/20 rounded-3xl border border-indigo-500/30 flex items-center justify-center shadow-[0_0_50px_-10px_rgba(99,102,241,0.5)]">
          <GraduationCap size={40} className="text-indigo-400" />
        </div>
        
        <div className="space-y-2">
          <h2 className="text-3xl font-bold">Portal do Aluno</h2>
          <p className="text-neutral-400">Insira o ID da sua correção para ver seu desempenho detalhado.</p>
        </div>

        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative group">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
              <Search size={18} className="text-neutral-500 group-focus-within:text-indigo-400 transition-colors" />
            </div>
            <input 
              type="text" 
              value={id}
              onChange={(e) => setId(e.target.value)}
              placeholder="Ex: ABCD-1234"
              className="block w-full pl-12 pr-4 py-5 bg-neutral-900 border border-white/5 rounded-2xl focus:border-indigo-500/50 outline-none transition-all text-lg font-mono tracking-widest text-white uppercase placeholder:text-neutral-700 placeholder:font-sans placeholder:tracking-normal"
              required
            />
          </div>
          
          <button 
            type="submit"
            disabled={isLoading || id.length < 4}
            className="w-full py-5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 transition-all rounded-2xl text-white font-bold flex items-center justify-center gap-2 group shadow-[0_0_30px_-10px_rgba(99,102,241,1)]"
          >
            {isLoading ? <Loader2 className="animate-spin" size={20} /> : 'Acessar Relatório'}
            {!isLoading && <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" />}
          </button>
        </form>

        <p className="text-neutral-600 text-[10px] uppercase tracking-widest font-bold">
          O código é gerado pelo seu professor após a correção
        </p>
      </motion.div>
    </div>
  );
}
