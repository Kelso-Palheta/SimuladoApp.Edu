"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AlunoRedacaoPage() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/aluno');
  }, [router]);

  return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-violet-700 to-violet-400 animate-pulse" />
    </div>
  );
}
